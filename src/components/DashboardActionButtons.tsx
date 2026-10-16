"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateApplicationStatus } from "@/actions/application";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function DashboardActionButtons({ appId }: { appId: string }) {
    const [isPending, startTransition] = useTransition();
    const [acceptOpen, setAcceptOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [reason, setReason] = useState("Skillset mismatch for current sprint");

    const handleStatusMutation = (status: "Accepted" | "Rejected") => {
        startTransition(async () => {
            try {
                await updateApplicationStatus(appId, status, status === "Rejected" ? reason : undefined);
                setAcceptOpen(false);
                setRejectOpen(false);
                if (status === "Accepted") {
                    toast.success("Peer match confirmed! Telemetry revealed.");
                } else {
                    toast.error("Application rejected. Applicant has been notified.");
                }
            } catch (err) {
                toast.error("Failed to mutate workflow status.");
            }
        });
    };

    return (
        <div className="flex gap-2 items-center">
            {isPending ? (
                <Button variant="ghost" disabled size="sm" className="text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </Button>
            ) : (
                <>
                    {/* REJECT DIALOG */}
                    <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">Reject</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Provide Rejection Reason</DialogTitle></DialogHeader>
                            <div className="flex flex-col gap-3 py-4">
                                {[
                                    "Skillset mismatch for current sprint",
                                    "Project roster is currently full",
                                    "Looking for a different domain expertise"
                                ].map((opt) => (
                                    <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-lg hover:bg-muted/50">
                                        <input type="radio" name="reason" value={opt} checked={reason === opt} onChange={(e) => setReason(e.target.value)} />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button variant="destructive" onClick={() => handleStatusMutation("Rejected")}>Confirm Rejection</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* ACCEPT DIALOG */}
                    <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">Accept Match</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-amber-500" /> Team Agreement</DialogTitle></DialogHeader>
                            <p className="text-sm text-muted-foreground py-4">
                                By accepting this applicant, their verified contact telemetry will be revealed to you. You agree to maintain a professional, collaborative environment as per campus ecosystem guidelines.
                            </p>
                            <DialogFooter>
                                <Button className="bg-green-600 hover:bg-green-700 text-white w-full" onClick={() => handleStatusMutation("Accepted")}>
                                    I Agree, Confirm Match
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}