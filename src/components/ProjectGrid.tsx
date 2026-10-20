"use client";

import { useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export interface ProjectItem {
    _id: string;
    title: string;
    description: string;
    required_skills: string[];
    domain?: string;
    [key: string]: unknown;
}

function matchesCategoryFilter(project: ProjectItem, selectedFilter: string): boolean {
    if (selectedFilter === "All") return true;

    const domain = (project.domain || "").toLowerCase();
    const title = (project.title || "").toLowerCase();
    const skills = (project.required_skills || []).map((s) => s.toLowerCase());
    const combined = `${domain} ${title} ${skills.join(" ")}`;

    switch (selectedFilter) {
        case "AI/Machine Learning":
            return (
                domain.includes("ai") ||
                domain.includes("ml") ||
                domain.includes("machine learning") ||
                combined.includes("gemini") ||
                combined.includes("tensorflow") ||
                combined.includes("pytorch") ||
                combined.includes("mlops") ||
                combined.includes("langchain") ||
                combined.includes("opencv")
            );
        case "Cloud/DevOps":
            return (
                domain.includes("cloud") ||
                domain.includes("devops") ||
                domain.includes("finops") ||
                combined.includes("kubernetes") ||
                combined.includes("docker") ||
                combined.includes("aws") ||
                combined.includes("terraform")
            );
        case "Web Development":
            return (
                domain.includes("web") ||
                domain.includes("open source") ||
                combined.includes("react") ||
                combined.includes("next.js") ||
                combined.includes("node.js") ||
                combined.includes("mongodb")
            );
        case "Hardware/IoT":
            return (
                domain.includes("iot") ||
                domain.includes("hardware") ||
                combined.includes("esp32") ||
                combined.includes("mqtt") ||
                combined.includes("embedded")
            );
        case "Web3/Crypto":
            return (
                domain.includes("web3") ||
                domain.includes("crypto") ||
                domain.includes("fintech") ||
                combined.includes("solidity") ||
                combined.includes("ethers") ||
                combined.includes("rust")
            );
        case "Mobile & AR":
            return (
                domain.includes("mobile") ||
                domain.includes("augmented reality") ||
                combined.includes("react native") ||
                combined.includes("flutter") ||
                combined.includes("swift")
            );
        default:
            return domain.includes(selectedFilter.toLowerCase());
    }
}

export default function ProjectGrid({
    initialProjects,
    appliedProjectIds = [],
}: {
    initialProjects: ProjectItem[];
    appliedProjectIds?: string[];
}) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const filteredProjects = initialProjects.filter((p) => {
        const query = search.toLowerCase();
        const matchesSearch =
            !query ||
            p.title.toLowerCase().includes(query) ||
            p.required_skills.some((skill) => skill.toLowerCase().includes(query)) ||
            p.description.toLowerCase().includes(query) ||
            Boolean(p.domain && p.domain.toLowerCase().includes(query));

        const matchesFilter = matchesCategoryFilter(p, filter);

        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProjects = filteredProjects.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilter(e.target.value);
        setCurrentPage(1);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by skill, architecture title, or domain..."
                            className="pl-10 h-10"
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="relative w-full sm:w-56">
                        <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <select
                            className="h-10 w-full pl-10 pr-4 rounded-md border border-input bg-background text-sm ring-offset-background"
                            value={filter}
                            onChange={handleFilter}
                        >
                            <option value="All">All Domains ({initialProjects.length})</option>
                            <option value="AI/Machine Learning">AI / Machine Learning</option>
                            <option value="Cloud/DevOps">Cloud / DevOps & FinOps</option>
                            <option value="Web Development">Full-Stack Web Development</option>
                            <option value="Hardware/IoT">Hardware & Edge IoT</option>
                            <option value="Web3/Crypto">FinTech & Web3</option>
                            <option value="Mobile & AR">Mobile & Spatial AR</option>
                        </select>
                    </div>
                </div>

                <span className="text-xs font-medium text-muted-foreground">
                    Showing <strong>{filteredProjects.length}</strong> active{" "}
                    {filteredProjects.length === 1 ? "architecture" : "architectures"}
                </span>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed rounded-xl bg-muted/20">
                    <h3 className="text-xl font-semibold mb-2">No architectures found</h3>
                    <p className="text-muted-foreground mb-4">
                        Try adjusting your search query or domain filter.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSearch("");
                            setFilter("All");
                            setCurrentPage(1);
                        }}
                    >
                        Reset Filters
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {paginatedProjects.map((project) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                initialApplied={appliedProjectIds.includes(
                                    project._id.toString()
                                )}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                            </Button>
                            <span className="text-sm font-medium text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </>
    );
}