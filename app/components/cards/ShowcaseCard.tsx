import { ArrowRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";

interface Item {
  id: string;
  title: string;
  summary: string;
  label: string;
  author: string;
  published: string;
  url: string;
  image: string;
}

interface ShowcaseCardProps {
  items: Item[];
}

const ShowcaseCard = ({ items }: ShowcaseCardProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {items.map((item) => (
        <Card
          key={item.id}
          className="grid grid-rows-[auto_auto_1fr_auto] pt-0"
        >
          <div className="aspect-16/9 w-full">
            <Image
              src={item.image}
              alt={item.title}
              width={500}
              height={500}
              className="h-full w-full object-contain object-center"
            />
          </div>
          <CardHeader>
            <h3 className="text-lg font-semibold hover:underline md:text-xl">
              <a href={`/design?item=${item.id}`} target="_blank">
                {item.title}
              </a>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{item.summary}</p>
          </CardContent>
          <CardFooter>
            <a
              href={`/design?item=${item.id}`}
              target="_blank"
              className="flex items-center text-foreground hover:underline"
            >
              Start to Design
              <ArrowRight className="ml-2 size-4" />
            </a>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ShowcaseCard;
