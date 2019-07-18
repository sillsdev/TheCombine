using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Services
{
    public class SemDomParser : ISemDomParser
    {
        private readonly IProjectService _projectService;

        public SemDomParser(IProjectService projectService)
        {
            _projectService = projectService;
        }

        public async Task<List<SemanticDomainWithSubdomains>> ParseSemanticDomains(string projectId)
        {
            var proj = await _projectService.GetProject(projectId);

            if (proj == null)
            {
                throw new Exception("Project not found");
            }

            var sdList = proj.SemanticDomains;

            if (sdList.Count == 0)
            {
                throw new Exception("No semantic domains found");
            }

            sdList.Sort(new SemDomComparer());

            var sdOfShortLengthList = new List<SemanticDomainWithSubdomains>();
            var sdOfLongLengthList = new List<SemanticDomainWithSubdomains>();
            var returnList = new List<SemanticDomainWithSubdomains>();
            int length = sdList[0].Id.Length;

            foreach (var sd in sdList)
            {
                if (sd.Id.Length != length)
                {
                    length += 2;
                    returnList.AddRange(sdOfShortLengthList);
                    sdOfShortLengthList.Clear();
                    sdOfShortLengthList.AddRange(sdOfLongLengthList);
                    sdOfLongLengthList.Clear();
                }

                var sdToAdd = new SemanticDomainWithSubdomains(sd);
                sdOfLongLengthList.Add(sdToAdd);
                if (sdOfShortLengthList.Count != 0)
                {
                    //find short length sd with same preceding number and add to children
                    foreach (var shortSd in sdOfShortLengthList)
                    {
                        if (sd.Id.StartsWith(shortSd.Id))
                        {
                            shortSd.Subdomains.Add(sdToAdd);
                        }
                    }
                }
            }
            return returnList;
        }

        private class SemDomComparer : IComparer<SemanticDomain>
        {
            public int Compare(SemanticDomain x, SemanticDomain y)
            {
                //sorts semantic domains by length of number, then numerically
                int lengthComparison = x.Id.Length.CompareTo(y.Id.Length);
                if (lengthComparison == 0)
                {
                    return x.Id.CompareTo(y.Id);
                }
                else
                {
                    return lengthComparison;
                }
            }
        }
    }
}