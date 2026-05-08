"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type AuthPageShellProps = {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  imageSide: "left" | "right"
  form: ReactNode
  secondaryAction?: ReactNode
  footer: ReactNode
}

export function AuthPageShell({
  title,
  description,
  imageSrc,
  imageAlt,
  imageSide,
  form,
  secondaryAction,
  footer,
}: AuthPageShellProps) {
  const reducedMotion = useReducedMotion()

  const stackVariants = {
    hidden: {},
    show: {
      transition: reducedMotion
        ? undefined
        : {
            staggerChildren: 0.1,
            delayChildren: 0.15,
          },
    },
  }

  const itemVariants = {
    hidden: reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : 0.65,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  const formPanel = (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, x: imageSide === "left" ? 36 : -36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex flex-1 items-center justify-center p-8 w-full lg:w-1/2"
    >
      <motion.div
        variants={stackVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm space-y-8"
      >
        <motion.div variants={itemVariants} className="text-center lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </motion.div>

        <motion.div variants={itemVariants}>{form}</motion.div>

        {secondaryAction ? (
          <motion.div variants={itemVariants}>{secondaryAction}</motion.div>
        ) : null}

        <motion.div variants={itemVariants}>{footer}</motion.div>
      </motion.div>
    </motion.div>
  )

  const imagePanel = (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, x: imageSide === "left" ? -42 : 42 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.95,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="hidden lg:flex lg:w-1/2 p-4 relative"
    >
      <div className="relative w-full h-full overflow-hidden rounded-2xl">
        <motion.div
          initial={reducedMotion ? false : { scale: 1.08, filter: "blur(6px)" }}
          animate={{ scale: 1, filter: "blur(0px)" }}
          transition={{
            duration: reducedMotion ? 0 : 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0"
        >
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" priority />
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : 0.1 }}
          className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30"
        />

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 1.1,
            delay: reducedMotion ? 0 : 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.18),transparent_46%)]"
        />

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.85,
            delay: reducedMotion ? 0 : 0.32,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center pointer-events-none z-10"
        >
          <motion.div
            animate={
              reducedMotion
                ? undefined
                : {
                    y: [0, -8, 0],
                    scale: [1, 1.02, 1],
                  }
            }
            transition={
              reducedMotion
                ? undefined
                : {
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
            className="relative drop-shadow-2xl flex items-center gap-4"
          >
            <Image
              src="/logo/logo.png"
              alt="MindSpace Logo"
              width={256}
              height={128}
              className="object-contain w-64 h-auto"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )

  return (
    <div className="relative isolate flex min-h-screen overflow-hidden bg-background">
      {imageSide === "left" ? imagePanel : null}
      {formPanel}
      {imageSide === "right" ? imagePanel : null}

      <motion.div
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 1.4 }}
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          "bg-[radial-gradient(circle_at_top,rgba(108,91,176,0.12),transparent_42%)]",
        )}
      />
    </div>
  )
}
