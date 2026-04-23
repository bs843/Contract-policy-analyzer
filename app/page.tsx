import AnalyzerForm from "@/components/AnalyzerForm";

export default function HomePage() {
    return (
        <main
            style={{
                maxWidth: 1100,
                margin: "0 auto",
                padding: 24,
                fontFamily: "Arial, sans-serif",
            }}
        >
            <AnalyzerForm />
        </main>
    );
}