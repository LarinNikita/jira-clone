'use client';

interface Props {
    params: {
        id: string;
    };
}

const Page = ({ params }: Props) => {
    const { id } = params;

    return (
        <>
            <h1>Page {id}</h1>
            <p>Page content</p>
        </>
    );
};

export default Page;
