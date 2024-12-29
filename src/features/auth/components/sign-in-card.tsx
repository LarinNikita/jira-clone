import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SignInCard = () => {
    return (
        <Card className="h-full w-full border-none shadow-none md:w-[487px]">
            <CardHeader className="flex items-center justify-center p-7 text-center">
                <CardTitle className="text-2xl">Welcome back!</CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                <form className="space-y-4">
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
                        Login
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
