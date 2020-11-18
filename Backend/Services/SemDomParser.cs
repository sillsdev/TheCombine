using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace BackendFramework.Services
{
    /// <summary> UNUSED: Creates a tree structure JSON object of semantic domains used by the front end </summary>
    public class SemDomParser : ISemDomParser
    {
        private readonly IProjectService _projectService;

        public SemDomParser(IProjectService projectService)
        {
            _projectService = projectService;
        }

        /// <summary> Return <see cref="SemanticDomainWithSubdomains"/> object from a
        /// <see cref="SemanticDomain"/> list of a <see cref="Project"/> </summary>
        public async Task<List<SemanticDomainWithSubdomains>> ParseSemanticDomains(string projectId)
        {
            // Ensure project exists
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
            {
                throw new Exception("Project not found");
            }

            // Ensure semantic domains exist
            var sdList = proj.SemanticDomains;
            if (sdList.Count == 0)
            {
                throw new Exception("No semantic domains found");
            }

            // Get list in nesting order
            sdList.Sort(new SemDomComparer());

            var sdOfShortLengthList = new List<SemanticDomainWithSubdomains>();
            var sdOfLongLengthList = new List<SemanticDomainWithSubdomains>();
            var returnList = new List<SemanticDomainWithSubdomains>();
            var length = sdList[0].Id.Length;

            foreach (var sd in sdList)
            {
                if (sd.Id.Length != length)
                {
                    // Add base level of semdom once we have hit the first entry of subdomains
                    if (length == 3)
                    {
                        returnList.AddRange(sdOfShortLengthList);
                    }

                    // Change tree depth level, eg. 1.1 to 1.1.1
                    length += 2;

                    // Replace short length list with long length
                    sdOfShortLengthList.Clear();
                    sdOfShortLengthList.AddRange(sdOfLongLengthList);
                    sdOfLongLengthList.Clear();
                }

                // Transform semdom type and keep track of it
                var sdToAdd = new SemanticDomainWithSubdomains(sd);
                sdOfLongLengthList.Add(sdToAdd);

                // If there are any, find short length semdom with same preceding number and add to children
                if (sdOfShortLengthList.Count != 0)
                {
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

        /// <summary> Sorts semantic domains by string length of the number, then numerically </summary>
        private class SemDomComparer : IComparer<SemanticDomain>
        {
            public int Compare(SemanticDomain? x, SemanticDomain? y)
            {
                if (x is null || y is null)
                {
                    return 0;
                }

                var lengthComparison = x.Id.Length.CompareTo(y.Id.Length);
                if (lengthComparison == 0)
                {
                    return x.Id.CompareTo(y.Id);
                }

                return lengthComparison;
            }
        }
    }
}
