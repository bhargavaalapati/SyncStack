import Navbar from "@/components/ui/Navbar";
import { getDashboardData, getMyApplications, updateApplicationStatus } from "@/actions/application";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaGithub } from "react-icons/fa";
import DashboardActionButtons from "@/components/DashboardActionButtons";

export default async function Dashboard() {
    const session = await auth();
    if (!session) redirect("/");

    // Fetch both sides of the marketplace
    const [inboundApplications, outboundApplications] = await Promise.all([
        getDashboardData(),
        getMyApplications()
    ]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
                <h1 className="text-4xl font-extrabold tracking-tight mb-8">Dashboard</h1>

                <Tabs defaultValue="inbound" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md">
                        <TabsTrigger value="inbound">Mission Control (Inbound)</TabsTrigger>
                        <TabsTrigger value="outbound">My Applications (Outbound)</TabsTrigger>
                    </TabsList>

                    {/* ========================================== */}
                    {/* TAB 1: CREATOR VIEW (INBOUND APPLICATIONS) */}
                    {/* ========================================== */}
                    <TabsContent value="inbound">
                        {inboundApplications.length === 0 ? (
                            <div className="text-center py-24 border-2 border-dashed rounded-xl bg-muted/20">
                                <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                                <p className="text-muted-foreground">Keep broadcasting your architectures to attract talent.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {inboundApplications.map((app: any) => (
                                    <div key={app._id} className="border rounded-xl p-6 bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            {app.applicant_id?.image ? (
                                                <img src={app.applicant_id.image} alt="avatar" className="w-12 h-12 rounded-full border" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-lg">
                                                    {app.applicant_id?.name?.charAt(0) || "U"}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-lg flex items-center gap-2">
                                                    {app.applicant_id?.name}
                                                    {/* Display their new role! */}
                                                    <Badge variant="secondary" className="text-[10px]">{app.applicant_id?.role || "Developer"}</Badge>
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1 mb-2 max-w-sm italic">
                                                    "{app.applicant_id?.bio || "No bio provided."}"
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Applied to: <span className="font-semibold text-foreground">{app.project_id?.title}</span>
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <a href={app.applicant_id?.github_url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 hover:text-primary transition-colors">
                                                        <FaGithub className="w-3 h-3" /> GitHub
                                                    </a>
                                                    <Badge variant="outline" className={
                                                        app.status === "Pending" ? "text-amber-500 border-amber-500/30" :
                                                            app.status === "Accepted" ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30"
                                                    }>
                                                        {app.status}
                                                    </Badge>
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {app.applicant_id?.tech_skills?.map((skill: string, i: number) => (
                                                        <Badge key={i} variant="secondary" className="text-[10px]">{skill}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            {/* Workflow Actions (Only show if Pending) */}
                                            {app.status === "Pending" && (
                                                <DashboardActionButtons appId={app._id} />
                                            )}

                                            {/* Secure Contact Reveal */}
                                            {app.status === "Accepted" && (
                                                <div className="text-right text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                                    <p className="font-bold text-green-600 dark:text-green-400 mb-1">Match Confirmed</p>
                                                    <a href={`mailto:${app.applicant_id?.email}`} className="text-xs text-primary hover:underline">
                                                        {app.applicant_id?.email}
                                                    </a>
                                                </div>
                                            )}

                                            {/* Rejection Log */}
                                            {app.status === "Rejected" && (
                                                <div className="text-right text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                    <p className="font-bold text-red-600 dark:text-red-400 mb-1">Declined</p>
                                                    <p className="text-xs text-muted-foreground">{app.rejection_reason || "No reason provided."}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ============================================ */}
                    {/* TAB 2: APPLICANT VIEW (OUTBOUND APPLICATIONS) */}
                    {/* ============================================ */}
                    <TabsContent value="outbound">
                        {outboundApplications.length === 0 ? (
                            <div className="text-center py-24 border-2 border-dashed rounded-xl bg-muted/20">
                                <h3 className="text-xl font-semibold mb-2">No outgoing requests</h3>
                                <p className="text-muted-foreground">Check the bulletin and find a project to contribute to.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {outboundApplications.map((app: any) => {
                                    // Determine if the project still exists or was decommissioned
                                    const isAlive = app.project_id && app.project_id.status !== "Decommissioned";

                                    return (
                                        <div key={app._id} className={`border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 ${isAlive ? 'bg-card' : 'bg-muted/30 border-dashed'}`}>
                                            <div className={!isAlive ? "opacity-60" : ""}>
                                                <h3 className="font-bold text-lg">
                                                    {app.project_id?.title || "Decommissioned Architecture"}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                                                    {app.project_id?.description || "This project has been closed and removed from the bulletin."}
                                                </p>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {isAlive ? `Led by ${app.project_id?.creator_id?.name}` : "Creator Unavailable"}
                                                    </span>
                                                    <Badge variant="outline" className={
                                                        app.status === "Pending" ? "text-amber-500 border-amber-500/30" :
                                                            app.status === "Accepted" ? "text-green-500 border-green-500/30" :
                                                                app.status === "Decommissioned" ? "text-gray-500 border-gray-500/30" : "text-red-500 border-red-500/30"
                                                    }>
                                                        {app.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end shrink-0">
                                                {app.status === "Accepted" && isAlive ? (
                                                    <div className="text-right text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                                        <p className="font-bold text-green-600 dark:text-green-400 mb-1">Welcome to the Team</p>
                                                        <p className="text-xs text-muted-foreground mb-1">Contact your lead:</p>
                                                        <a href={`mailto:${app.project_id?.creator_id?.email}`} className="text-xs font-semibold text-primary hover:underline">
                                                            {app.project_id?.creator_id?.email}
                                                        </a>
                                                    </div>
                                                ) : app.status === "Rejected" ? (
                                                    <div className="text-right text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                        <p className="font-bold text-red-600 dark:text-red-400 mb-1">Creator Declined</p>
                                                        <p className="text-xs text-muted-foreground">Reason: {app.rejection_reason || "Went with another candidate."}</p>
                                                    </div>
                                                ) : app.status === "Decommissioned" || !isAlive ? (
                                                    <div className="text-right text-sm bg-gray-500/10 p-3 rounded-lg border border-gray-500/20">
                                                        <p className="font-bold text-gray-600 dark:text-gray-400 mb-1">Project Closed</p>
                                                        <p className="text-xs text-muted-foreground">The creator has halted this architecture.</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground animate-pulse">Awaiting creator review...</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}