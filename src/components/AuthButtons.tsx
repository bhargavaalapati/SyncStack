"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LoginButton({ loginAction }: { loginAction: () => void }) {
    return (
        <form action={loginAction} onSubmit={() => toast.loading("Connecting to GitHub OAuth...")}>
            <Button size="sm" type="submit">Continue with GitHub</Button>
        </form>
    );
}

export function LogoutButton({ logoutAction }: { logoutAction: () => void }) {
    return (
        <form action={logoutAction} onSubmit={() => toast.info("Securely terminating session...")}>
            <button type="submit" className="w-full">
                <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                </DropdownMenuItem>
            </button>
        </form>
    );
}