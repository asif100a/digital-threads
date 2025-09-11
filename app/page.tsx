import Image from "next/image";
import ShowcaseCard from "./components/cards/ShowcaseCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { items } from "./assets/data";

const tagline = "Latest Updates";
const heading = "Choose a block to edit";
const description =
  "Discover the latest trends, tips, and best practices in modern web development. From UI components to design systems, stay updated with our expert insights.";
const buttonText = "View all blocks";
const buttonUrl = "https://shadcnblocks.com";


export default function Home() {
  return (
    <>
      <section className="py-32">
        <div className="container mx-auto flex flex-col items-center gap-16 lg:px-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6">
              {tagline}
            </Badge>
            <h2 className="mb-3 text-3xl font-semibold text-pretty md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl capitalize">
              {heading}
            </h2>
            <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
              {description}
            </p>
            <Button variant="link" className="w-full sm:w-auto" asChild>
              <a href={buttonUrl} target="_blank">
                {buttonText}
                <ArrowRight className="ml-2 size-4" />
              </a>
            </Button>
          </div>

          {/* Showcase Card */}
          <ShowcaseCard items={items} />
        </div>
      </section>
    </>
  );
}
