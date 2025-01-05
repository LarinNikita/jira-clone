'use client';

import { useCreateTaskModal } from '../hooks/use-create-task-modal';

import { CreateTaskFormWrapper } from './create-task-form-wrapper';

import { ResponsiveModal } from '@/components/responsive-modal';

export const CreateTaskModal = () => {
    const { isOpen, setIsOpen } = useCreateTaskModal();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
            <CreateTaskFormWrapper onCancel={() => setIsOpen(false)} />
        </ResponsiveModal>
    );
};
