import { cn } from '@/lib/utils';

interface DottedSeparatorProps {
    className?: string;
    color?: string;
    height?: string;
    dotSize?: string;
    gapSize?: string;
    orientation?: 'vertical' | 'horizontal';
    text?: string;
}

export const DottedSeparator = ({
    className,
    color = '#d4d4d8',
    height = '2px',
    dotSize = '2px',
    gapSize = '6px',
    orientation = 'horizontal',
    text,
}: DottedSeparatorProps) => {
    const isHorizontal = orientation === 'horizontal';

    return (
        <div
            className={cn(
                isHorizontal
                    ? 'flex w-full items-center'
                    : 'flex h-full flex-col items-center',
                className,
            )}
        >
            <div
                className={isHorizontal ? 'flex-grow' : 'flex-grow-0'}
                style={{
                    width: isHorizontal ? '100%' : height,
                    height: isHorizontal ? height : '100%',
                    backgroundImage: `radial-gradient(circle, ${color} 25%, transparent 25%)`,
                    backgroundSize: isHorizontal
                        ? `${parseInt(dotSize) + parseInt(gapSize)}px ${height}`
                        : `${height} ${parseInt(dotSize) + parseInt(gapSize)}px`,
                    backgroundRepeat: isHorizontal ? 'repeat-x' : 'repeat-y',
                    backgroundPosition: 'center',
                }}
            />
            {text && (
                <>
                    <div className="px-1 text-center text-lg text-[#3f3f41]">
                        {text}
                    </div>

                    <div
                        className={isHorizontal ? 'flex-grow' : 'flex-grow-0'}
                        style={{
                            width: isHorizontal ? '100%' : height,
                            height: isHorizontal ? height : '100%',
                            backgroundImage: `radial-gradient(circle, ${color} 25%, transparent 25%)`,
                            backgroundSize: isHorizontal
                                ? `${parseInt(dotSize) + parseInt(gapSize)}px ${height}`
                                : `${height} ${parseInt(dotSize) + parseInt(gapSize)}px`,
                            backgroundRepeat: isHorizontal
                                ? 'repeat-x'
                                : 'repeat-y',
                            backgroundPosition: 'center',
                        }}
                    />
                </>
            )}
        </div>
    );
};
