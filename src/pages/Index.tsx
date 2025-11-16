import Hero from "@/components/Hero";
import About from "@/components/About";
import Process from "@/components/Process";
import Activities from "@/components/Activities";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Process />
      <Activities />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
