import { SelectedPage, ClassType } from "@/shared/types";

import image1 from "@/assets/image1.png";
import image2 from "@/assets/image2.png";
import image3 from "@/assets/image3.png";
import image4 from "@/assets/image4.png";
import image5 from "@/assets/image5.png";
import image6 from "@/assets/image6.png";

import { motion } from "framer-motion";
import HText from "@/shared/HText";
import Class from "./Class";

const jobs: Array<ClassType> = [
  {
    name: "House Cleaning",
    description:
      "Find reliable workers to help with cleaning your home, office, or other spaces. Describe the work you need and connect with suitable workers nearby.",
    image: image1,
  },
  {
    name: "Gardening & Yard Work",
    description:
      "Need help maintaining your garden or yard? Post your task and find workers with the skills to get the job done.",
    image: image2,
  },
  {
    name: "Moving & Lifting",
    description:
      "Get help with moving furniture, carrying heavy items, loading and unloading, and other tasks that require an extra pair of hands.",
    image: image3,
  },
  {
    name: "Construction & Repairs",
    description:
      "Connect with workers who have experience in construction, repairs, maintenance, and other practical tasks.",
    image: image4,
  },
  {
    name: "Delivery & Errands",
    description:
      "Need something delivered or an errand completed? Post your task and find someone nearby who can help.",
    image: image5,
  },
  {
    name: "Other Piecework",
    description:
      "Have a task that doesn't fit into a specific category? Post the details and discover workers with the skills you need.",
    image: image6,
  },
];

type Props = {
  setSelectedPage: (value: SelectedPage) => void;
};

const PostJob = ({ setSelectedPage }: Props) => {
  return (
    <section
      id="postjob"
      className="w-full bg-primary-100 py-32 md:py-40"
    >
      <motion.div
        onViewportEnter={() =>
          setSelectedPage(SelectedPage.PostJob)
        }
      >
        {/* HEADER */}

        <motion.div
          className="mx-auto w-5/6"
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.5,
          }}
          transition={{
            duration: 0.5,
          }}
          variants={{
            hidden: {
              opacity: 0,
              x: -50,
            },
            visible: {
              opacity: 1,
              x: 0,
            },
          }}
        >
          <div className="md:w-3/5">
            <HText>
              <span className="text-primary-500">
                POST A JOB
              </span>{" "}
              AND FIND THE RIGHT WORKER
            </HText>

            <p className="py-5">
              Have a task that needs to be done? Post your
              job on KaJob and connect with reliable workers
              near you. Choose the type of work you need and
              let suitable workers discover your opportunity.
            </p>
          </div>
        </motion.div>

        {/* JOB CATEGORIES */}

        <div className="mt-10 h-[353px] w-full overflow-x-auto overflow-y-hidden">
          <ul className="w-[2800px] whitespace-nowrap">
            {jobs.map((item: ClassType, index) => (
              <Class
                key={`${item.name}-${index}`}
                name={item.name}
                description={item.description}
                image={item.image}
              />
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
};

export default PostJob;