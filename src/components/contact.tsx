import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { person } from "@/content/portfolio";

const secondaryLinkClass =
  "inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spartan-600 dark:border-zinc-700 dark:hover:bg-zinc-900";

export function Contact() {
  return (
    <Section id="contact" title="Contact">
      <Reveal>
        <div className="max-w-2xl">
          <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Interested in working together?
          </h3>
          <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
            I'm open to conversations about senior engineering leadership,
            platform engineering, cloud, and AI infrastructure roles. The
            fastest way to reach me is email.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${person.email}`}
              className="inline-flex items-center gap-2 rounded-lg bg-spartan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-spartan-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spartan-600"
            >
              <MailIcon className="size-4" />
              {person.email}
            </a>
            <a
              href={person.linkedin}
              rel="me noreferrer"
              target="_blank"
              className={secondaryLinkClass}
            >
              <LinkedInIcon className="size-4" />
              LinkedIn
            </a>
            <a
              href={person.github}
              rel="me noreferrer"
              target="_blank"
              className={secondaryLinkClass}
            >
              <GitHubIcon className="size-4" />
              GitHub
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
