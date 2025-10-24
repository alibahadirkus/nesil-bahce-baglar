import Hero from "@/components/Hero";
import About from "@/components/About";
import Activities from "@/components/Activities";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Activities />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
