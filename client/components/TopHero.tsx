type TopHeroProps = {
    lable: string;
    component?: React.ReactNode;
};

const TopHero: React.FC<TopHeroProps> = (props: TopHeroProps) => {
    return (
        <div className={`bg-white top-hero px-5 py-3 text-lg font-semibold rounded-b-lg ${props.component && "flex items-center justify-between"}`}>
            <h1>{props.lable}</h1>
            {props.component && <>{props.component}</>}
        </div>
    );
};

export default TopHero;
