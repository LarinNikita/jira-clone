'use client';

import { useRef } from 'react';

import { z } from 'zod';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';

import { useUpdateProject } from '../api/use-update-project';
import { useDeleteProject } from '../api/use-delete-project';

import { useConfirm } from '@/hooks/use-confirm';

import { cn } from '@/lib/utils';

import { Project } from '../types';
import { updateProjectSchema } from '../schemas';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

interface EditProjectFormProps {
    onCancel?: () => void;
    initialValues: Project;
}

export const EditProjectForm = ({
    onCancel,
    initialValues,
}: EditProjectFormProps) => {
    const router = useRouter();
    const { mutate, isPending } = useUpdateProject();
    const { mutate: deleteProject, isPending: isDeletingProject } =
        useDeleteProject();

    const [DeleteDialog, confirmDelete] = useConfirm(
        'Delete Project',
        'Are you sure you want to delete this Project? This action cannot be undone.',
        'destructive',
    );

    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof updateProjectSchema>>({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? '',
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('image', file);
        }
    };

    const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : '',
        };

        mutate({
            form: finalValues,
            param: { projectId: initialValues.$id },
        });
    };

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        deleteProject(
            {
                param: { projectId: initialValues.$id },
            },
            {
                onSuccess: () => {
                    window.location.href = `/workspaces/${initialValues.workspaceId}`;
                },
            },
        );
    };

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            <Card className="h-full w-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 space-y-0 p-7">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={
                            onCancel
                                ? onCancel
                                : () =>
                                      router.push(
                                          `/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`,
                                      )
                        }
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold">
                        {initialValues.name}
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeparator />
                </div>
                <CardContent className="p-7">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="Enter your Project name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-y-2">
                                            <div className="flex items-center gap-x-5">
                                                {field.value ? (
                                                    <div className="relative size-[72px] overflow-hidden rounded-md">
                                                        <Image
                                                            src={
                                                                field.value instanceof
                                                                File
                                                                    ? URL.createObjectURL(
                                                                          field.value,
                                                                      )
                                                                    : field.value
                                                            }
                                                            alt="Logo"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <Avatar className="size-[72px]">
                                                        <AvatarFallback>
                                                            <ImageIcon className="size-[36px] text-neutral-400" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <p className="text-sm">
                                                        Project Icon
                                                    </p>
                                                    <p className="text-muted-foreground text-sm">
                                                        JPG, PNG, SVG, or JPEG,
                                                        max 1 MB
                                                    </p>
                                                    <input
                                                        className="hidden"
                                                        type="file"
                                                        accept=".jpg, .png, .jpeg, .svg"
                                                        ref={inputRef}
                                                        onChange={
                                                            handleImageChange
                                                        }
                                                        disabled={isPending}
                                                    />
                                                    {field.value ? (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="destructive"
                                                            size="xs"
                                                            className="mt-2 w-fit"
                                                            onClick={() => {
                                                                field.onChange(
                                                                    null,
                                                                );
                                                                if (
                                                                    inputRef.current
                                                                ) {
                                                                    inputRef.current.value =
                                                                        '';
                                                                }
                                                            }}
                                                        >
                                                            Remove Image
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="tertiary"
                                                            size="xs"
                                                            className="mt-2 w-fit"
                                                            onClick={() =>
                                                                inputRef.current?.click()
                                                            }
                                                        >
                                                            Upload Image
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            <DottedSeparator className="py-7" />
                            <div className="flex items-center justify-between">
                                <Button
                                    disabled={isPending}
                                    type="button"
                                    size="lg"
                                    variant="secondary"
                                    onClick={onCancel}
                                    className={cn(!onCancel && 'invisible')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isPending}
                                    type="submit"
                                    size="lg"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="h-full w-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="text-destructive font-bold">
                            Danger Zone
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Deleting a Project is irreversible and will remove
                            all associated data.
                        </p>
                        <DottedSeparator className="py-7" />
                        <Button
                            className="ml-auto mt-6 w-fit"
                            size="sm"
                            variant="destructive"
                            type="button"
                            disabled={isPending || isDeletingProject}
                            onClick={handleDelete}
                        >
                            Delete Project
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
