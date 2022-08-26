using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace BackendFramework.Models
{
    public class SemanticDomain
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Id { get; set; }

        public SemanticDomain()
        {
            Name = "";
            Id = "";
        }

        public SemanticDomain Clone()
        {
            return new SemanticDomain
            {
                Name = (string)Name.Clone(),
                Id = (string)Id.Clone()
            };
        }

        public override bool Equals(object? obj)
        {
            if (obj is not SemanticDomain other || GetType() != obj.GetType())
            {
                return false;
            }

            return Name.Equals(other.Name) && Id.Equals(other.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Name, Id);
        }
    }

    public class SemanticDomainFull
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Id { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public List<string> Questions { get; set; }

        public SemanticDomainFull()
        {
            Name = "";
            Id = "";
            Description = "";
            Questions = new List<string>();
        }

        public SemanticDomainFull Clone()
        {
            var clone = new SemanticDomainFull
            {
                Name = (string)Name.Clone(),
                Id = (string)Id.Clone(),
                Description = (string)Description.Clone(),
                Questions = new List<string>()
            };

            foreach (var question in Questions)
            {
                clone.Questions.Add((string)question.Clone());
            }

            return clone;
        }

        public override bool Equals(object? obj)
        {
            if (obj is not SemanticDomainFull other || GetType() != obj.GetType())
            {
                return false;
            }

            return
                Name.Equals(other.Name) &&
                Id.Equals(other.Id) &&
                Description.Equals(other.Description) &&
                Questions.Count == other.Questions.Count &&
                Questions.All(other.Questions.Contains);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Name, Id, Description, Questions);
        }
    }

    public class SemanticDomainTreeNode
    {
        [Required]
        public SemanticDomain Node { get; set; }
        [Required]
        public SemanticDomain Parent { get; set; }
        [Required]
        public SemanticDomain Previous { get; set; }
        [Required]
        public SemanticDomain Next { get; set; }
        [Required]
        public List<SemanticDomain> Children { get; set; }

        public SemanticDomainTreeNode()
        {
            Node = new SemanticDomain();
            Parent = new SemanticDomain();
            Previous = new SemanticDomain();
            Next = new SemanticDomain();
            Children = new List<SemanticDomain>();
        }

        public SemanticDomainTreeNode Clone()
        {
            var clone = new SemanticDomainTreeNode
            {
                Node = Node.Clone(),
                Parent = Parent.Clone(),
                Previous = Previous.Clone(),
                Next = Next.Clone(),
                Children = new List<SemanticDomain>()
            };

            foreach (var child in Children)
            {
                clone.Children.Add(child.Clone());
            }

            return clone;
        }

        public override bool Equals(object? obj)
        {
            if (obj is not SemanticDomainTreeNode other || GetType() != obj.GetType())
            {
                return false;
            }

            return
                Node.Equals(other.Node) &&
                Parent.Equals(other.Parent) &&
                Previous.Equals(other.Previous) &&
                Next.Equals(other.Next) &&
                Children.Count == other.Children.Count &&
                Children.All(other.Children.Contains);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Node, Parent, Previous, Next, Children);
        }
    }

    /// <remarks>
    /// This is used in an OpenAPI return value serializer, so its attributes must be defined as properties.
    /// </remarks>
    public class SemanticDomainWithSubdomains
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Id { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public List<SemanticDomainWithSubdomains> Subdomains { get; set; }

        public SemanticDomainWithSubdomains(SemanticDomain sd)
        {
            Name = sd.Name;
            Id = sd.Id;
            Description = "";
            Subdomains = new List<SemanticDomainWithSubdomains>();
        }
    }
}
