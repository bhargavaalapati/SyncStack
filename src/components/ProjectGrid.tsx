"use client";

import { useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProjectGrid({ initialProjects, appliedProjectIds = [] }: { initialProjects: any[], appliedProjectIds?: string[] }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const filteredProjects = initialProjects.filter((p) => {
        const matchesSearch =
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.required_skills.some((skill: string) => skill.toLowerCase().includes(search.toLowerCase())) ||
            p.description.toLowerCase().includes(search.toLowerCase()) ||
            (p.domain && p.domain.toLowerCase().includes(search.toLowerCase()));

        const matchesFilter = filter === "All" || p.domain === filter;

        return matchesSearch && matchesFilter;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 if user types in search
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
            <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by skill, title..."
                        className="pl-10 h-10"
                        value={search}
                        onChange={handleSearch}
                    />
                </div>
                <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <select
                        className="h-10 w-full pl-10 pr-4 rounded-md border border-input bg-background text-sm ring-offset-background"
                        value={filter}
                        onChange={handleFilter}
                    >
                        <option value="All">All Domains</option>
                        <option value="Web Development">Web Development</option>
                        <option value="AI/Machine Learning">AI/Machine Learning</option>
                        <option value="Cloud/DevOps">Cloud/DevOps</option>
                        <option value="Web3/Crypto">Web3/Crypto</option>
                        <option value="Mobile Development">Mobile Development</option>
                    </select>
                </div>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed rounded-xl bg-muted/20">
                    <h3 className="text-xl font-semibold mb-2">No architectures found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {paginatedProjects.map((project: any) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                initialApplied={appliedProjectIds.includes(project._id.toString())}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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