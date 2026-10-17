import Navbar from "@/components/ui/Navbar";
import { getDashboardData, getMyApplications } from "@/actions/application";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GithubIcon from "@/components/icons/GithubIcon";
import DashboardActionButtons from "@/components/DashboardActionButtons";
import { Users, ShieldCheck, CheckCircle2, Send, Clock } from "lucide-react";

export default async function Dashboard() {
    const session = await auth();
    if (!session) redirect("/");

    const [inboundApplications, outboundApplications] = await Promise.all([
        getDashboardData(),
        getMyApplications(),
    ]);

    // Calculate real-time executive KPI metrics
    const totalInbound = inboundApplications.length;
    const pendingInbound = inboundApplications.filter(
        (a: any) => a.status === "Pending"
    ).length;
    const acceptedInbound = inboundApplications.filter(
        (a: any) => a.status === "Accepted"
    ).length;
    const totalOutbound = outboundApplications.length;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Workforce Command Center
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage incoming talent pipelines, inspect AI-verified trust telemetry, and track project applications.
                        </p>
                    </div>
                    <Badge variant="outline" className="w-fit gap-1.5 py-1 px-3 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Telemetry Synced
                    </Badge>
                </div>

                {/* EXECUTIVE KPI TELEMETRY RIBBON */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-xl border bg-card p-4 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                            <span>Inbound Talent</span>
                            <Users className="w-4 h-4 text-indigo-400" />
                        </div>
                        <p className="text-2xl font-black">{totalInbound}</p>
                        <span className="text-[11px] text-muted-foreground">
                            Total candidate requests
                        </span>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                            <span>Awaiting Review</span>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-black text-amber-500">{pendingInbound}</p>
                        <span className="text-[11px] text-muted-foreground">
                            Action required in queue
                        </span>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                            <span>Confirmed Matches</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-emerald-500">{acceptedInbound}</p>
                        <span className="text-[11px] text-muted-foreground">
                            Onboarded engineers
                        </span>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                            <span>Outbound Pitches</span>
                            <Send className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-2xl font-black">{totalOutbound}</p>
                        <span className="text-[11px] text-muted-foreground">
                            Architectures applied to
                        </span>
                    </div>
                </div>

                <Tabs defaultValue="inbound" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md">
                        <TabsTrigger value="inbound">
                            Mission Control ({totalInbound})
                        </TabsTrigger>
                        <TabsTrigger value="outbound">
                            My Applications ({totalOutbound})
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: CREATOR VIEW (INBOUND APPLICATIONS) */}
                    <TabsContent value="inbound">
                        {inboundApplications.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
                                <h3 className="text-xl font-semibold mb-2">
                                    No inbound applications yet
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Broadcast your architectures on the Bulletin to attract verified talent.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {inboundApplications.map((app: any) => (
                                    <div
                                        key={app._id}
                                        className="border rounded-xl p-6 bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                                    >
                                        <div className="flex items-start gap-4 min-w-0">
                                            {app.applicant_id?.image ? (
                                                <img
                                                    src={app.applicant_id.image}
                                                    alt="avatar"
                                                    className="w-12 h-12 rounded-full border shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-lg shrink-0">
                                                    {app.applicant_id?.name?.charAt(0) || "U"}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-bold text-lg truncate">
                                                        {app.applicant_id?.name}
                                                    </h3>
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {app.applicant_id?.role || "Developer"}
                                                    </Badge>
                                                    {app.applicant_id?.trust_score > 0 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] border-emerald-500/30 text-emerald-500 gap-1"
                                                        >
                                                            <ShieldCheck className="w-3 h-3" />
                                                            {app.applicant_id.trust_score}% Trust
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 mb-2 max-w-md italic">
                                                    &ldquo;{app.applicant_id?.bio || "No bio provided."}&rdquo;
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Target Architecture:{" "}
                                                    <span className="font-semibold text-foreground">
                                                        {app.project_id?.title}
                                                    </span>
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    {app.applicant_id?.github_url && (
                                                        <a
                                                            href={
                                                                app.applicant_id.github_url.startsWith("http")
                                                                    ? app.applicant_id.github_url
                                                                    : `https://github.com/${app.applicant_id.github_url}`
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs flex items-center gap-1 hover:text-primary transition-colors"
                                                        >
                                                            <GithubIcon className="w-3 h-3" /> GitHub
                                                        </a>
                                                    )}
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            app.status === "Pending"
                                                                ? "text-amber-500 border-amber-500/30"
                                                                : app.status === "Accepted"
                                                                ? "text-emerald-500 border-emerald-500/30"
                                                                : "text-red-500 border-red-500/30"
                                                        }
                                                    >
                                                        {app.status}
                                                    </Badge>
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {app.applicant_id?.tech_skills?.map(
                                                        (skill: string, i: number) => (
                                                            <Badge
                                                                key={i}
                                                                variant="secondary"
                                                                className="text-[10px]"
                                                            >
                                                                {skill}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            {app.status === "Pending" && (
                                                <DashboardActionButtons appId={app._id} />
                                            )}

                                            {app.status === "Accepted" && (
                                                <div className="text-right text-sm bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                                                    <p className="font-bold text-emerald-500 mb-1">
                                                        Match Confirmed
                                                    </p>
                                                    <a
                                                        href={`mailto:${app.applicant_id?.email}`}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        {app.applicant_id?.email}
                                                    </a>
                                                </div>
                                            )}

                                            {app.status === "Rejected" && (
                                                <div className="text-right text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                    <p className="font-bold text-red-500 mb-1">Declined</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {app.rejection_reason || "No reason provided."}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB 2: APPLICANT VIEW (OUTBOUND APPLICATIONS) */}
                    <TabsContent value="outbound">
                        {outboundApplications.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
                                <h3 className="text-xl font-semibold mb-2">
                                    No outgoing requests
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Explore the Bulletin and request to join an active architecture.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {outboundApplications.map((app: any) => {
                                    const isAlive =
                                        app.project_id &&
                                        app.project_id.status !== "Decommissioned";

                                    return (
                                        <div
                                            key={app._id}
                                            className={`border rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                                                isAlive
                                                    ? "bg-card"
                                                    : "bg-muted/30 border-dashed"
                                            }`}
                                        >
                                            <div className={!isAlive ? "opacity-60" : ""}>
                                                <h3 className="font-bold text-lg">
                                                    {app.project_id?.title ||
                                                        "Decommissioned Architecture"}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                                                    {app.project_id?.description ||
                                                        "This project has been closed and removed from the bulletin."}
                                                </p>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {isAlive
                                                            ? `Led by ${app.project_id?.creator_id?.name}`
                                                            : "Creator Unavailable"}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            app.status === "Pending"
                                                                ? "text-amber-500 border-amber-500/30"
                                                                : app.status === "Accepted"
                                                                ? "text-emerald-500 border-emerald-500/30"
                                                                : app.status === "Decommissioned"
                                                                ? "text-gray-500 border-gray-500/30"
                                                                : "text-red-500 border-red-500/30"
                                                        }
                                                    >
                                                        {app.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end shrink-0">
                                                {app.status === "Accepted" && isAlive ? (
                                                    <div className="text-right text-sm bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                                                        <p className="font-bold text-emerald-500 mb-1">
                                                            Welcome to the Team
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mb-1">
                                                            Contact your lead:
                                                        </p>
                                                        <a
                                                            href={`mailto:${app.project_id?.creator_id?.email}`}
                                                            className="text-xs font-semibold text-primary hover:underline"
                                                        >
                                                            {app.project_id?.creator_id?.email}
                                                        </a>
                                                    </div>
                                                ) : app.status === "Rejected" ? (
                                                    <div className="text-right text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                        <p className="font-bold text-red-500 mb-1">
                                                            Creator Declined
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Reason:{" "}
                                                            {app.rejection_reason ||
                                                                "Went with another candidate."}
                                                        </p>
                                                    </div>
                                                ) : app.status === "Decommissioned" || !isAlive ? (
                                                    <div className="text-right text-sm bg-gray-500/10 p-3 rounded-lg border border-gray-500/20">
                                                        <p className="font-bold text-gray-400 mb-1">
                                                            Project Closed
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            The creator has halted this architecture.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground animate-pulse">
                                                        Awaiting creator review...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}