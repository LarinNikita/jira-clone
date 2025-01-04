'use client';

import { useRef } from 'react';

import { z } from 'zod';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateProject } from '../api/use-create-project';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

import { cn } from '@/lib/utils';

import { createProjectSchema } from '../schemas';

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

interface CreateProjectFormProps {
    onCancel?: () => void;
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const { mutate, isPending } = useCreateProject();

    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof createProjectSchema>>({
        resolver: zodResolver(createProjectSchema.omit({ workspaceId: true })),
        defaultValues: {
            name: '',
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('image', file);
        }
    };

    const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
        const finalValues = {
            ...values,
            workspaceId,
            image: values.image instanceof File ? values.image : '',
        };

        mutate(
            { form: finalValues },
            {
                onSuccess: ({ data }) => {
                    form.reset();
                    //TODO Redirect to project page
                },
            },
        );
    };

    return (
        <Card className="h-full w-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    Create a new project
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
                                                placeholder="Enter your project name"
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
                                                    JPG, PNG, SVG, or JPEG, max
                                                    1 MB
                                                </p>
                                                <input
                                                    className="hidden"
                                                    type="file"
                                                    accept=".jpg, .png, .jpeg, .svg"
                                                    ref={inputRef}
                                                    onChange={handleImageChange}
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
                                Create Project
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};