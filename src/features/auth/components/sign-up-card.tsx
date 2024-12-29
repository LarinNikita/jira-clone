import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';

export const SignUpCard = () => {
    return (
        <Card className="h-full w-full border-none shadow-none md:w-[487px]">
            <CardHeader className="flex items-center justify-center p-7 text-center">
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>
                    By signing up, you agree to our{' '}
                    <Link href="/privacy">
                        <span className="text-blue-700 hover:underline">
                            Privacy Policy
                        </span>
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms">
                        <span className="text-blue-700 hover:underline">
                            Terms of Service
                        </span>
                    </Link>
                </CardDescription>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                <form className="space-y-4">
                    <Input
                        required
                        type="text"
                        value={''}
                        onChange={() => {}}
                        placeholder="Enter name"
                        disabled={false}
                    />
                    <Input
                        required
                        type="email"
                        value={''}
                        onChange={() => {}}
                        placeholder="Enter email address"
                        disabled={false}
                    />
                    <Input
                        required
                        type="password"
                        value={''}
                        onChange={() => {}}
                        placeholder="Enter password"
                        disabled={false}
                        min={8}
                        max={256}
                    />
                    <Button disabled={false} size="lg" className="w-full">
                        Sign up
                    </Button>
                </form>
            </CardContent>
            <div className="px-7">
                <DottedSeparator text="or" />
            </div>
            <CardContent className="flex flex-col gap-y-4 p-7">
                <Button
                    disabled={false}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                >
                    <FcGoogle className="mr-2 size-5" />
                    Login with Google
                </Button>
                <Button
                    disabled={false}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                >
                    <FaGithub className="mr-2 size-5" />
                    Login with Github
                </Button>
            </CardContent>
        </Card>
    );
};
