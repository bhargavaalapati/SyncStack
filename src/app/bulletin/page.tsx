import Navbar from "@/components/ui/Navbar";
import CreateProjectDialog from "@/components/CreateProjectDialog";
import { getOpenProjects } from "@/actions/project";
import { getMyApplications } from "@/actions/application";
import ProjectGrid from "@/components/ProjectGrid";
import { auth } from "@/auth";

export default async function Bulletin() {
  const session = await auth();
  const projects = await getOpenProjects();

  // FIXED AMNESIA BUG: Grab all projects the current user has already applied to
  let appliedProjectIds: string[] = [];
  if (session?.user?.id) {
    const myApps = await getMyApplications();
    appliedProjectIds = myApps.map((app: any) =>
      app.project_id?._id?.toString() || app.project_id?.toString()
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar /> {/* Safely rendered on the server! */}

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">The Project Bulletin</h1>
          </div>
          {session?.user && <CreateProjectDialog />}
        </div>

        {/* Pass down the applied array to lock the buttons globally */}
        <ProjectGrid initialProjects={projects} appliedProjectIds={appliedProjectIds} />

      </main>
    </div>
  );
}