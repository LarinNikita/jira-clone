'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useJoinWorkspace } from '../api/use-join-workspace';

import { useInviteCode } from '../hooks/use-invite-code';
import { useWorkspaceId } from '../hooks/use-workspace-id';

import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface JoinWorkspaceFormProps {
    initialValues: {
        name: string;
    };
}

export const JoinWorkspaceForm = ({
    initialValues,
}: JoinWorkspaceFormProps) => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const inviteCode = useInviteCode();
    const { mutate, isPending } = useJoinWorkspace();

    const onSubmit = () => {
        mutate(
            {
                param: { workspaceId },
                json: {
                    code: inviteCode,
                },
            },
            {
                onSuccess: ({ data }) => {
                    router.push(`/workspaces/${data.$id}`);
                },
            },
        );
    };

    return (
        <Card className="h-full w-full border-none shadow-none">
            <CardHeader className="p-7">
                <CardTitle className="text-xl font-bold">
                    Join Workspace
                </CardTitle>
                <CardDescription>
                    You&apos;ve been invited to join{' '}
                    <strong>{initialValues.name}</strong> workspace
                </CardDescription>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
                    <Button
                        className="w-full lg:w-fit"
                        variant="secondary"
                        size="lg"
                        type="button"
                        asChild
                        disabled={isPending}
                    >
                        <Link href="/">Cancel</Link>
                    </Button>
                    <Button
                        className="w-full lg:w-fit"
                        variant="primary"
                        size="lg"
                        type="button"
                        onClick={onSubmit}
                        disabled={isPending}
                    >
                        Join Workspace
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
