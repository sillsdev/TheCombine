using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using SIL.Lift.Parsing;
using System;
using System.IO;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/Projects/Words/Upload")]
    public class UploadContoller : Controller
    {
        public readonly ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> _merger;

        public UploadContoller(ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> merger)
        {
            _merger = merger;
        }

        // POST: v1/Project/Words/upload
        // Implements: Upload(), Arguments: FileUpload model
        [HttpPost]
        public async Task<IActionResult> Post([FromForm] FileUpload model)
        {
            var file = model.File;

            if (file.Length > 0)
            {
                model.FilePath = Path.Combine("./uploadFile-" + model.Name + ".xml");
                using (var fs = new FileStream(model.FilePath, FileMode.Create))
                {
                    await file.CopyToAsync(fs);
                }
            }
            try
            {
                var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(_merger);
                return new ObjectResult(parser.ReadLiftFile(model.FilePath));
            }
            catch (Exception)
            {
                return new UnsupportedMediaTypeResult();
            }
        }
    }
}
