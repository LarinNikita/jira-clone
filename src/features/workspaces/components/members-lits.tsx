'use client';

import { Fragment } from 'react';

import Link from 'next/link';
import { ArrowLeft, MoreVertical } from 'lucide-react';

import { MemberRole } from '@/features/members/types';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { useDeleteMember } from '@/features/members/api/use-delete-member';
import { useUpdateMember } from '@/features/members/api/use-update-member';

import { useConfirm } from '@/hooks/use-confirm';
import { useWorkspaceId } from '../hooks/use-workspace-id';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DottedSeparator } from '@/components/dotted-separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const MembersList = () => {
    const workspaceId = useWorkspaceId();
    const { data } = useGetMembers({ workspaceId });

    const [ConfirmDialog, confirm] = useConfirm(
        'Remove member',
        'This member will be removed from the workspace',
        'destructive',
    );

    const { mutate: deleteMember, isPending: isDeletingMember } =
        useDeleteMember();

    const { mutate: updateMember, isPending: isUpdatingMember } =
        useUpdateMember();

    const handleUpdateMember = (memberId: string, role: MemberRole) => {
        updateMember(
            {
                param: { memberId },
                json: { role },
            },
            {
                onSuccess: () => {
                    window.location.reload();
                },
            },
        );
    };

    const handleDeleteMember = async (memberId: string) => {
        const ok = await confirm();

        if (!ok) return;

        deleteMember(
            { param: { memberId } },
            {
                onSuccess: () => {
                    window.location.reload();
                },
            },
        );
    };

    return (
        <Card className="h-full w-full border-none shadow-none">
            <ConfirmDialog />
            <CardHeader className="flex flex-row items-center gap-x-4 space-y-0 p-7">
                <Button asChild variant="secondary" size="sm">
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeft className="mr-2 size-4" />
                        Back
                    </Link>
                </Button>
                <CardTitle className="text-xl font-bold">
                    Members List
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                {data?.documents.map((member, index) => (
                    <Fragment key={index}>
                        <div className="flex items-center gap-2">
                            <MemberAvatar
                                className="size-10"
                                fallbackClassName="text-lg"
                                name={member.name}
                            />
                            <div className="flex flex-col">
                                <p className="text-sm font-medium">
                                    {member.name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {member.email}
                                </p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="ml-auto"
                                    >
                                        <MoreVertical className="text-muted-foreground size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" side="bottom">
                                    <DropdownMenuItem
                                        className="font-medium"
                                        onClick={() =>
                                            handleUpdateMember(
                                                member.$id,
                                                MemberRole.ADMIN,
                                            )
                                        }
                                        disabled={isUpdatingMember}
                                    >
                                        Set as Administrator
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="font-medium"
                                        onClick={() =>
                                            handleUpdateMember(
                                                member.$id,
                                                MemberRole.MEMBER,
                                            )
                                        }
                                        disabled={isUpdatingMember}
                                    >
                                        Set as Member
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="font-medium text-amber-700"
                                        onClick={() =>
                                            handleDeleteMember(member.$id)
                                        }
                                        disabled={isDeletingMember}
                                    >
                                        Remove {member.name}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {index < data.documents.length - 1 && (
                            <Separator className="my-2.5" />
                        )}
                    </Fragment>
                ))}
            </CardContent>
        </Card>
    );
};
