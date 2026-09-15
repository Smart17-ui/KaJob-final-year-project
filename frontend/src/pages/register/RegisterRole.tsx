import {
  ArrowLeftIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    value: "CLIENT",
    title: "I'm a Client",
    description:
      "Post jobs, find skilled workers, and get your tasks done.",
    icon: BriefcaseIcon,
    path: "/register/client",
  },
  {
    value: "WORKER",
    title: "I'm a Worker",
    description:
      "Find jobs, apply for work, and build your reputation.",
    icon: WrenchScrewdriverIcon,
    path: "/register/worker",
  },
];

export default function RegisterRole() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute left-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 sm:left-8 sm:top-8"
        aria-label="Go back"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>

      <div className="flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Main Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
            {/* Logo / Brand */}
            <div className="mb-8 text-center">
              <div className="mb-5 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
                  <BriefcaseIcon className="h-7 w-7 text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create your KaJob account
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                How do you want to use KaJob?
              </p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role, index) => {
                const Icon = role.icon;

                return (
                  <motion.button
                    key={role.value}
                    type="button"
                    onClick={() => navigate(role.path)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1,
                    }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h2 className="mt-4 text-sm font-semibold text-slate-900">
                      {role.title}
                    </h2>

                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      {role.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Login */}
            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-emerald-600 transition hover:text-emerald-700"
              >
                Log in
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}