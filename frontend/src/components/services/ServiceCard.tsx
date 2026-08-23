import { FC, ComponentType } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export interface ServiceCardProps {
  title: string;
  icon: ComponentType<{
    className?: string;
  }>;
  path: string;
}

const ServiceCard: FC<ServiceCardProps> = ({
  title,
  icon: Icon,
  path,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{
        y: -4,
      }}
      whileTap={{
        scale: 0.97,
      }}
      className="
        group
        relative
        flex
        h-full
        w-full
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-gray-200
        bg-white
        px-3
        py-4
        text-center
        shadow-sm
        transition-all
        duration-300
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-primary-500
        focus:ring-offset-2
      "
    >
      {/* ICON */}

      <motion.div
        whileHover={{
          scale: 1.08,
        }}
        className="
          mb-2
          rounded-full
          bg-primary-50
          p-2.5
          transition-colors
          duration-300
          group-hover:bg-primary-100
        "
      >
        <Icon
          className="
            h-6
            w-6
            text-primary-500
          "
        />
      </motion.div>

      {/* TITLE */}

      <h3
        className="
          text-sm
          font-semibold
          text-gray-900
          transition-colors
          duration-300
          group-hover:text-primary-500
          sm:text-base
        "
      >
        {title}
      </h3>

      {/* ARROW */}

      <motion.span
        className="
          absolute
          bottom-2
          right-3
          text-sm
          text-primary-500
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
        initial={{
          x: 0,
        }}
        whileHover={{
          x: 3,
        }}
      >
        →
      </motion.span>
    </motion.button>
  );
};

export default ServiceCard;