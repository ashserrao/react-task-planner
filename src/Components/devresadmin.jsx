import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createResource,
  deleteResource,
  fetchResources,
  updateResource,
} from "./devResourcesApi";

const RESOURCE_TYPE = "Dev Resource";

/* ---------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------- */

// Accepts an array or a comma-separated string, always returns an array.
const toArray = (value) =>
  Array.isArray(value)
    ? value.filter(Boolean)
    : String(value ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

const getHostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

// Fallback title if a row has no resource_title.
const extractTitleFromUrl = (url) => {
  const host = getHostname(url);
  if (!host) return url || "Untitled";
  const name = host.split(".")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const formatAdded = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
};

// Maps one sheet row (API JSON) to the shape the UI uses.
const normalizeResource = (row, index) => {
  const addedAt = row.resource_timestamp
    ? new Date(row.resource_timestamp).getTime()
    : 0;

  return {
    id: row.resource_url || `row-${row._row ?? index}`,
    title:
      String(row.resource_title || "").trim() ||
      extractTitleFromUrl(row.resource_url),
    types: toArray(row.resource_type),
    subCategories: toArray(row.resource_sub_category),
    url: row.resource_url || "",
    description: row.resource_desc || "",
    rating: Number(row.resource_rating) || 0,
    addedAt: Number.isNaN(addedAt) ? 0 : addedAt,
  };
};

const isDevResource = (r) =>
  r.url &&
  r.types.some((t) => t.toLowerCase() === RESOURCE_TYPE.toLowerCase());

const isHttpUrl = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

// Form values -> sheet columns (the shape the Apps Script expects).
const toSheetFields = (values, types) => ({
  resource_title: values.title.trim(),
  resource_type: types,
  resource_sub_category: values.subCategories,
  resource_desc: values.description,
  resource_rating: values.rating === "" ? "" : Number(values.rating),
});

const SORTS = {
  newest: { label: "Newest first", fn: (a, b) => b.addedAt - a.addedAt },
  rating: {
    label: "Top rated",
    fn: (a, b) => b.rating - a.rating || b.addedAt - a.addedAt,
  },
  az: { label: "A to Z", fn: (a, b) => a.title.localeCompare(b.title) },
};

/* ---------------------------------------------------------------------
 * Markdown
 * ------------------------------------------------------------------- */

// Tailwind styles for each Markdown element rendered in the modal.
const markdownComponents = {
  h1: ({ node, children, ...props }) => (
    <h1 className="text-2xl font-display font-semibold text-white mt-6 mb-3 first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ node, children, ...props }) => (
    <h2 className="text-xl font-display font-semibold text-white mt-6 mb-3 first:mt-0" {...props}>
      {children}
    </h2>
  ),
  h3: ({ node, children, ...props }) => (
    <h3 className="text-lg font-display font-semibold text-white mt-5 mb-2 first:mt-0" {...props}>
      {children}
    </h3>
  ),
  h4: ({ node, children, ...props }) => (
    <h4 className="text-base font-semibold text-white mt-4 mb-2 first:mt-0" {...props}>
      {children}
    </h4>
  ),
  p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
  a: ({ node, children, ...props }) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#8cfcfb] underline underline-offset-2 hover:text-white break-words"
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  del: ({ node, ...props }) => (
    <del className="line-through opacity-70" {...props} />
  ),
  ul: ({ node, className, ...props }) => (
    <ul
      className={
        className?.includes("contains-task-list")
          ? "mb-4 space-y-1"
          : "list-disc pl-6 mb-4 space-y-1 marker:text-[#8cfcfb]"
      }
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1 marker:text-[#8cfcfb]" {...props} />
  ),
  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
  input: ({ node, ...props }) => (
    <input className="mr-2 align-middle accent-[#8cfcfb]" disabled {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-l-4 border-[#8cfcfb]/50 pl-4 my-4 italic text-[#c2ccaa]/90"
      {...props}
    />
  ),
  hr: ({ node, ...props }) => (
    <hr className="my-6 border-[#c2ccaa]/20" {...props} />
  ),
  pre: ({ node, ...props }) => (
    <pre
      className="mb-4 p-4 rounded-lg bg-black/50 border border-[#c2ccaa]/15 overflow-x-auto text-sm [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[#e6f7f7]"
      {...props}
    />
  ),
  code: ({ node, ...props }) => (
    <code
      className="font-mono text-[0.9em] px-1.5 py-0.5 rounded bg-black/40 text-[#8cfcfb]"
      {...props}
    />
  ),
  table: ({ node, ...props }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th
      className="text-left font-semibold text-white border-b border-[#c2ccaa]/30 px-3 py-2"
      {...props}
    />
  ),
  td: ({ node, ...props }) => (
    <td className="border-b border-[#c2ccaa]/10 px-3 py-2" {...props} />
  ),
  img: ({ node, alt, ...props }) => (
    <img alt={alt || ""} loading="lazy" className="max-w-full rounded-lg my-4" {...props} />
  ),
};

// Full Markdown, used in the modal.
const MarkdownContent = ({ children }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
    {children}
  </ReactMarkdown>
);

// Inline-only Markdown for the card preview: block elements (headings, lists,
// tables, links...) are unwrapped to plain text so the 3-line clamp stays tidy
// and nothing inside the card steals the card's click.
const CARD_INLINE_ELEMENTS = ["strong", "em", "del", "code"];
const MarkdownPreview = ({ children }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    allowedElements={CARD_INLINE_ELEMENTS}
    unwrapDisallowed
    components={{
      strong: markdownComponents.strong,
      em: markdownComponents.em,
      del: markdownComponents.del,
      code: markdownComponents.code,
    }}
  >
    {children}
  </ReactMarkdown>
);

/* ---------------------------------------------------------------------
 * Small components
 * ------------------------------------------------------------------- */

const SiteIcon = ({ url, title }) => {
  const [failed, setFailed] = useState(false);
  const host = getHostname(url);

  if (!host || failed) {
    return (
      <div className="w-11 h-11 shrink-0 rounded-lg bg-black/40 border border-[#c2ccaa]/15 flex items-center justify-center text-lg font-display font-semibold text-[#8cfcfb]">
        {title.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="w-11 h-11 shrink-0 rounded-lg bg-black/40 border border-[#c2ccaa]/15 flex items-center justify-center">
      <img
        src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
        alt=""
        width={24}
        height={24}
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-6 h-6 rounded-sm"
      />
    </div>
  );
};

const FilterChip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb] ${active
      ? "bg-[#8cfcfb] text-black border-[#8cfcfb] font-semibold"
      : "bg-transparent text-[#c2ccaa] border-[#c2ccaa]/25 hover:border-[#8cfcfb]/60 hover:text-white"
      }`}
  >
    {children}
  </button>
);

const SkeletonCard = () => (
  <div className="rounded-2xl bg-[#6A0C0B]/60 border border-[#c2ccaa]/10 p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-11 h-11 rounded-lg bg-black/30" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-black/30" />
        <div className="h-3 w-1/3 rounded bg-black/20" />
      </div>
    </div>
    <div className="space-y-2 mb-6">
      <div className="h-3 rounded bg-black/20" />
      <div className="h-3 w-5/6 rounded bg-black/20" />
    </div>
    <div className="h-9 rounded-lg bg-black/20" />
  </div>
);

const Spinner = ({ className = "w-4 h-4" }) => (
  <svg
    className={`${className} animate-spin`}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      className="opacity-25"
    />
    <path
      d="M22 12a10 10 0 00-10-10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const ResourceCard = ({
  resource,
  index,
  onOpen,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const { title, subCategories, url, description, rating, addedAt } = resource;
  const host = getHostname(url);
  const added = formatAdded(addedAt);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`View details for ${title}`}
      onClick={() => onOpen(resource)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(resource);
        }
      }}
      className="group relative flex flex-col h-full cursor-pointer rounded-2xl bg-gradient-to-b from-[#7a0f0e] to-[#5a0a09] border border-[#c2ccaa]/15 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-[border-color,box-shadow] duration-300 hover:border-[#8cfcfb]/40 hover:shadow-[0_18px_40px_rgba(140,252,251,0.12)] focus-within:border-[#8cfcfb]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb]"
    >
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start gap-3 mb-4">
          <SiteIcon url={url} title={title} />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-display font-semibold text-white leading-snug truncate">
              {title}
            </h3>
            {host && (
              <p className="text-sm text-[#c2ccaa]/70 truncate">{host}</p>
            )}
          </div>
          {rating > 0 && (
            <span
              className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-[#8cfcfb] bg-black/30 rounded-full px-2.5 py-1"
              title={`Rating: ${rating}`}
            >
              <svg
                viewBox="0 0 20 20"
                className="w-3.5 h-3.5 fill-current"
                aria-hidden="true"
              >
                <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7L10 1.5z" />
              </svg>
              {rating}
            </span>
          )}
        </div>

        <div className="text-[#c2ccaa] text-sm leading-relaxed mb-5 flex-grow line-clamp-3">
          {description ? (
            <MarkdownPreview>{description}</MarkdownPreview>
          ) : (
            "No description yet."
          )}
        </div>

        {subCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {subCategories.map((sub) => (
              <span
                key={sub}
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#8cfcfb]/15 text-[#8cfcfb]"
              >
                {sub}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-[#c2ccaa]/10 flex flex-wrap items-center gap-3">
          {added && (
            <span className="text-xs text-[#c2ccaa]/60">Added {added}</span>
          )}
          {/* stopPropagation keeps these from also opening the details modal */}
          <div className="ml-auto flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(resource);
              }}
              disabled={isDeleting}
              aria-label={`Edit ${title}`}
              className="p-2 rounded-lg text-[#c2ccaa] hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb]"
            >
              <svg
                className="w-4 h-4 fill-none stroke-current"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(resource);
              }}
              disabled={isDeleting}
              aria-label={`Delete ${title}`}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              {isDeleting ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <svg
                  className="w-4 h-4 fill-none stroke-current"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Visit ${title} (opens in a new tab)`}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-[#8cfcfb]/10 text-[#8cfcfb] font-semibold border border-[#8cfcfb]/30 hover:bg-[#8cfcfb] hover:text-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb]"
            >
              Visit site
              <svg
                viewBox="0 0 20 20"
                className="w-4 h-4 fill-none stroke-current"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  d="M11 3h6v6M17 3l-8 8M8 5H4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
};

/* ---------------------------------------------------------------------
 * Modals
 * ------------------------------------------------------------------- */

// Counts open modals so overlapping ones (e.g. details -> edit while the
// details modal is still animating out) don't unlock page scroll early.
let openModalCount = 0;

// Shared overlay + dialog: locks page scroll, closes on Escape / backdrop
// click (unless `dismissible` is false), and returns focus on close.
const ModalShell = ({
  onClose,
  labelledBy,
  initialFocusRef,
  dismissible = true,
  className = "max-w-xl",
  children,
}) => {
  const dialogRef = useRef(null);
  const pressedBackdrop = useRef(false);

  // Kept in refs so the mount effect below runs once and never steals focus back.
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  onCloseRef.current = onClose;
  dismissibleRef.current = dismissible;

  useEffect(() => {
    const previousFocus = document.activeElement;
    openModalCount += 1;
    document.body.style.overflow = "hidden";
    (initialFocusRef?.current || dialogRef.current)?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape" && dismissibleRef.current) onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      openModalCount -= 1;
      if (openModalCount === 0) document.body.style.overflow = "";
      // Only hand focus back if nothing else (like another modal) has taken it.
      const active = document.activeElement;
      if ((!active || active === document.body) && previousFocus?.isConnected)
        previousFocus.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      // Close only when the press both starts and ends on the backdrop, so
      // dragging a text selection out of the dialog doesn't close it.
      onMouseDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (
          pressedBackdrop.current &&
          e.target === e.currentTarget &&
          dismissible
        )
          onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className={`relative w-full ${className} max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#7a0f0e] to-[#5a0a09] border border-[#8cfcfb]/30 shadow-[0_24px_60px_rgba(0,0,0,0.6)] focus:outline-none`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

const CloseButton = React.forwardRef(({ onClick, disabled }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label="Close"
    className="shrink-0 w-9 h-9 rounded-full text-2xl leading-none text-[#c2ccaa] hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb]"
  >
    &times;
  </button>
));

const ResourceModal = ({ resource, onClose, onEdit, onDelete }) => {
  const closeRef = useRef(null);

  const { title, types, subCategories, url, description, rating, addedAt } =
    resource;
  const host = getHostname(url);
  const added = formatAdded(addedAt);

  return (
    <ModalShell
      onClose={onClose}
      labelledBy="resource-modal-title"
      initialFocusRef={closeRef}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <SiteIcon url={url} title={title} />
          <div className="min-w-0 flex-1">
            <h3
              id="resource-modal-title"
              className="text-2xl font-display font-semibold text-white leading-snug break-words"
            >
              {title}
            </h3>
            {host && (
              <p className="text-sm text-[#c2ccaa]/70 break-all">{host}</p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-9 h-9 rounded-full text-2xl leading-none text-[#c2ccaa] hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb]"
          >
            &times;
          </button>
        </div>

        <div className="text-[#c2ccaa] leading-relaxed mb-6 break-words">
          {description ? (
            <MarkdownContent>{description}</MarkdownContent>
          ) : (
            <p>No description yet.</p>
          )}
        </div>

        {(types.length > 0 || subCategories.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {types.map((type) => (
              <span
                key={`type-${type}`}
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/30 text-[#c2ccaa]"
              >
                {type}
              </span>
            ))}
            {subCategories.map((sub) => (
              <span
                key={`sub-${sub}`}
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#8cfcfb]/15 text-[#8cfcfb]"
              >
                {sub}
              </span>
            ))}
          </div>
        )}

        <dl className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="rounded-lg bg-black/25 p-3">
            <dt className="text-[#c2ccaa]/60 mb-1">Rating</dt>
            <dd className="font-semibold text-[#8cfcfb]">
              {rating > 0 ? rating : "Not rated"}
            </dd>
          </div>
          <div className="rounded-lg bg-black/25 p-3">
            <dt className="text-[#c2ccaa]/60 mb-1">Added</dt>
            <dd className="font-semibold text-white">{added || "Unknown"}</dd>
          </div>
        </dl>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${title} (opens in a new tab)`}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#8cfcfb] text-black font-semibold hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Visit site
            <svg
              viewBox="0 0 20 20"
              className="w-4 h-4 fill-none stroke-current"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                d="M11 3h6v6M17 3l-8 8M8 5H4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onEdit(resource)}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-black/25 text-[#c2ccaa] font-semibold border border-[#c2ccaa]/20 hover:border-[#8cfcfb]/60 hover:text-[#8cfcfb] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb]"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(resource)}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-black/25 text-red-300 font-semibold border border-red-400/25 hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const inputClass =
  "w-full bg-[#1a0a0a] border border-[#c2ccaa]/30 rounded-lg py-2.5 px-3.5 text-white placeholder:text-[#c2ccaa]/40 focus:outline-none focus:border-[#8cfcfb] focus:ring-1 focus:ring-[#8cfcfb] transition-colors aria-[invalid=true]:border-red-400";

const labelClass = "block text-sm font-semibold text-white mb-1.5";

const FieldError = ({ id, children }) =>
  children ? (
    <p id={id} className="mt-1.5 text-sm text-red-300">
      {children}
    </p>
  ) : null;

const toFormValues = (resource) => ({
  title: resource?.title ?? "",
  url: resource?.url ?? "",
  subCategories: resource?.subCategories ?? [],
  description: resource?.description ?? "",
  rating: resource?.rating > 0 ? String(resource.rating) : "",
});

// Add / edit form. `resource` is null when adding. `onSubmit` receives the
// cleaned values and should throw on failure; the error is shown in the form.
const ResourceFormModal = ({
  resource,
  subOptions,
  takenUrls,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(resource);
  const [values, setValues] = useState(() => toFormValues(resource));
  const [subInput, setSubInput] = useState("");
  const [descTab, setDescTab] = useState("write");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  const setField = (field) => (e) => {
    const { value } = e.target;
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const addSubCategories = (raw) => {
    const added = toArray(raw);
    if (added.length)
      setValues((v) => ({
        ...v,
        subCategories: [...new Set([...v.subCategories, ...added])],
      }));
    setSubInput("");
  };

  const removeSubCategory = (sub) =>
    setValues((v) => ({
      ...v,
      subCategories: v.subCategories.filter((s) => s !== sub),
    }));

  const suggestions = subOptions.filter(
    (s) => s !== "All" && !values.subCategories.includes(s),
  );

  const validate = (v) => {
    const next = {};
    if (!v.url) next.url = "URL is required.";
    else if (!isHttpUrl(v.url))
      next.url = "Enter a full URL starting with http:// or https://.";
    else if (v.url !== resource?.url && takenUrls.has(v.url))
      next.url = "A resource with this URL already exists.";

    if (v.rating !== "") {
      const n = Number(v.rating);
      if (!Number.isFinite(n) || n < 0 || n > 5)
        next.rating = "Rating must be between 0 and 5.";
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    // Include a category that was typed but not yet confirmed with Enter.
    const cleaned = {
      ...values,
      url: values.url.trim(),
      subCategories: [
        ...new Set([...values.subCategories, ...toArray(subInput)]),
      ],
    };
    const nextErrors = validate(cleaned);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    setSubmitError("");
    try {
      await onSubmit(cleaned);
    } catch (err) {
      setSubmitError(err.message);
      setSaving(false);
    }
  };

  const heading = isEdit ? "Edit resource" : "Add resource";

  return (
    <ModalShell
      onClose={onClose}
      labelledBy="resource-form-title"
      initialFocusRef={titleRef}
      dismissible={!saving}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <h3
            id="resource-form-title"
            className="flex-1 text-2xl font-display font-semibold text-white"
          >
            {heading}
          </h3>
          <CloseButton onClick={onClose} disabled={saving} />
        </div>

        <fieldset disabled={saving} className="space-y-5">
          <div>
            <label htmlFor="rf-title" className={labelClass}>
              Title
            </label>
            <input
              ref={titleRef}
              id="rf-title"
              type="text"
              value={values.title}
              onChange={setField("title")}
              placeholder="e.g. UI Verse"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="rf-url" className={labelClass}>
              URL <span className="text-[#8cfcfb]">*</span>
            </label>
            <input
              id="rf-url"
              type="url"
              inputMode="url"
              required
              value={values.url}
              onChange={setField("url")}
              placeholder="https://example.com"
              aria-invalid={Boolean(errors.url)}
              aria-describedby={errors.url ? "rf-url-error" : undefined}
              className={inputClass}
            />
            <FieldError id="rf-url-error">{errors.url}</FieldError>
          </div>

          <div>
            <label htmlFor="rf-sub" className={labelClass}>
              Categories
            </label>
            {values.subCategories.length > 0 && (
              <ul className="flex flex-wrap gap-2 mb-2" aria-label="Selected categories">
                {values.subCategories.map((sub) => (
                  <li key={sub}>
                    <button
                      type="button"
                      onClick={() => removeSubCategory(sub)}
                      aria-label={`Remove ${sub}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold pl-2.5 pr-2 py-1 rounded-full bg-[#8cfcfb]/15 text-[#8cfcfb] hover:bg-[#8cfcfb]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb]"
                    >
                      {sub}
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input
              id="rf-sub"
              type="text"
              value={subInput}
              onChange={(e) => {
                const { value } = e.target;
                // Typing a comma confirms the category before it.
                if (value.includes(",")) addSubCategories(value);
                else setSubInput(value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSubCategories(subInput);
                } else if (
                  e.key === "Backspace" &&
                  !subInput &&
                  values.subCategories.length
                ) {
                  removeSubCategory(
                    values.subCategories[values.subCategories.length - 1],
                  );
                }
              }}
              onBlur={() => addSubCategories(subInput)}
              placeholder="Type a category and press Enter"
              aria-describedby="rf-sub-hint"
              className={inputClass}
            />
            <p id="rf-sub-hint" className="mt-1.5 text-xs text-[#c2ccaa]/60">
              Separate several with commas.
            </p>
            {suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => addSubCategories(sub)}
                    className="text-xs px-2.5 py-1 rounded-full border border-[#c2ccaa]/25 text-[#c2ccaa] hover:border-[#8cfcfb]/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb]"
                  >
                    + {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="rf-desc" className="text-sm font-semibold text-white">
                Description
              </label>
              <div
                role="tablist"
                aria-label="Description mode"
                className="inline-flex rounded-lg bg-black/30 p-0.5 text-xs"
              >
                {["write", "preview"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={descTab === tab}
                    onClick={() => setDescTab(tab)}
                    className={`px-3 py-1 rounded-md capitalize font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb] ${descTab === tab
                      ? "bg-[#8cfcfb] text-black"
                      : "text-[#c2ccaa] hover:text-white"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {descTab === "write" ? (
              <textarea
                id="rf-desc"
                rows={7}
                value={values.description}
                onChange={setField("description")}
                placeholder="What is it, and why is it useful? Markdown is supported."
                className={`${inputClass} font-mono text-sm leading-relaxed resize-y min-h-[9rem]`}
              />
            ) : (
              <div className="min-h-[9rem] max-h-80 overflow-y-auto rounded-lg border border-[#c2ccaa]/30 bg-[#1a0a0a] p-4 text-[#c2ccaa] leading-relaxed break-words">
                {values.description.trim() ? (
                  <MarkdownContent>{values.description}</MarkdownContent>
                ) : (
                  <p className="text-[#c2ccaa]/50">Nothing to preview yet.</p>
                )}
              </div>
            )}
            <p className="mt-1.5 text-xs text-[#c2ccaa]/60">
              Supports Markdown: **bold**, _italic_, `code`, lists, links and
              tables.
            </p>
          </div>

          <div className="max-w-[10rem]">
            <label htmlFor="rf-rating" className={labelClass}>
              Rating (0–5)
            </label>
            <input
              id="rf-rating"
              type="number"
              min={0}
              max={5}
              step={1}
              value={values.rating}
              onChange={setField("rating")}
              placeholder="—"
              aria-invalid={Boolean(errors.rating)}
              aria-describedby={errors.rating ? "rf-rating-error" : undefined}
              className={inputClass}
            />
            <FieldError id="rf-rating-error">{errors.rating}</FieldError>
          </div>
        </fieldset>

        {submitError && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {submitError}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="py-2.5 px-5 rounded-lg text-[#c2ccaa] font-semibold border border-[#c2ccaa]/25 hover:text-white hover:border-[#c2ccaa]/60 disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-5 rounded-lg bg-[#8cfcfb] text-black font-semibold hover:bg-white disabled:opacity-60 disabled:cursor-wait transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add resource"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

const DeleteConfirmModal = ({ resource, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const cancelRef = useRef(null);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await onConfirm(resource);
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      labelledBy="resource-delete-title"
      initialFocusRef={cancelRef}
      dismissible={!deleting}
      className="max-w-md"
    >
      <div className="p-6 sm:p-8">
        <div className="w-12 h-12 mb-4 rounded-full bg-red-500/15 text-red-300 flex items-center justify-center">
          <Trash2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3
          id="resource-delete-title"
          className="text-xl font-display font-semibold text-white mb-2 break-words"
        >
          Delete “{resource.title}”?
        </h3>
        <p className="text-[#c2ccaa]">
          This removes the row from the Google Sheet. It can't be undone.
        </p>

        {deleteError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {deleteError}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="py-2.5 px-5 rounded-lg text-[#c2ccaa] font-semibold border border-[#c2ccaa]/25 hover:text-white hover:border-[#c2ccaa]/60 disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="py-2.5 px-5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-wait transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

// Bottom-centre status message for successful/failed actions.
const Toast = ({ toast, onDismiss }) => (
  <div
    className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm pointer-events-none"
    role="status"
    aria-live="polite"
  >
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.5)] ${toast.type === "error"
            ? "bg-[#3a0a0a] border-red-400/40 text-red-200"
            : "bg-[#0d1f1f] border-[#8cfcfb]/40 text-[#8cfcfb]"
            }`}
        >
          <p className="flex-1 text-sm font-semibold">{toast.message}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="-mr-1 w-6 h-6 rounded-full leading-none opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ---------------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------------- */

const DevResAdmin = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSub, setActiveSub] = useState("All");
  const [sortKey, setSortKey] = useState("newest");
  const [selectedResource, setSelectedResource] = useState(null);
  const closeModal = useCallback(() => setSelectedResource(null), []);

  // CRUD state. `editing` is { resource } (null resource = adding).
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Card whose delete request is in flight (shows a spinner on its button).
  const [deletingId, setDeletingId] = useState(null);
  // Every URL in the sheet (any type), so the form can block duplicates.
  const [takenUrls, setTakenUrls] = useState(() => new Set());
  const [toast, setToast] = useState(null);

  const notify = useCallback(
    (type, message) => setToast({ type, message, id: Date.now() }),
    [],
  );

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // READ. `silent` refreshes in the background (after a write) without the
  // skeleton; responses from older requests are ignored.
  const latestLoad = useRef(0);
  const loadResources = useCallback(
    async ({ signal, silent = false } = {}) => {
      const requestId = ++latestLoad.current;
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      try {
        const data = await fetchResources({ signal });
        if (requestId !== latestLoad.current) return;

        setTakenUrls(
          new Set(
            data
              .map((row) => String(row.resource_url ?? "").trim())
              .filter(Boolean),
          ),
        );
        setResources(data.map(normalizeResource).filter(isDevResource));
        setError(null);
      } catch (err) {
        if (err.name === "AbortError" || requestId !== latestLoad.current)
          return;
        if (silent) notify("error", `Couldn't refresh the list. ${err.message}`);
        else setError(err.message);
      } finally {
        if (!silent && requestId === latestLoad.current && !signal?.aborted)
          setLoading(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadResources({ signal: controller.signal });
    return () => controller.abort();
  }, [loadResources]);

  const openAdd = () => setEditing({ resource: null });
  const openEdit = useCallback((resource) => {
    setSelectedResource(null);
    setEditing({ resource });
  }, []);
  const openDelete = useCallback((resource) => {
    setSelectedResource(null);
    setDeleteTarget(resource);
  }, []);

  // CREATE / UPDATE. Applies the change locally straight away, then
  // re-reads the sheet in the background so local state matches it.
  const handleSave = async (values) => {
    const original = editing?.resource;

    if (original) {
      const types = original.types.length ? original.types : [RESOURCE_TYPE];
      const fields = toSheetFields(values, types);
      if (values.url !== original.url) fields.new_resource_url = values.url;

      await updateResource(original.url, fields);

      const updated = normalizeResource({
        ...fields,
        resource_url: values.url,
        resource_timestamp: original.addedAt
          ? new Date(original.addedAt).toISOString()
          : "",
      });
      setResources((prev) =>
        prev.map((r) => (r.id === original.id ? updated : r)),
      );
      notify("success", "Resource updated.");
    } else {
      const fields = {
        ...toSheetFields(values, [RESOURCE_TYPE]),
        resource_url: values.url,
        resource_timestamp: new Date().toISOString(),
      };

      await createResource(fields);

      setResources((prev) => [normalizeResource(fields), ...prev]);
      notify("success", "Resource added.");
    }

    setTakenUrls((prev) => {
      const next = new Set(prev);
      if (original) next.delete(original.url);
      next.add(values.url);
      return next;
    });
    setEditing(null);
    loadResources({ silent: true });
  };

  // DELETE
  const handleDelete = async (resource) => {
    setDeletingId(resource.id);
    try {
      await deleteResource(resource.url);
    } finally {
      setDeletingId(null);
    }

    setResources((prev) => prev.filter((r) => r.id !== resource.id));
    setTakenUrls((prev) => {
      const next = new Set(prev);
      next.delete(resource.url);
      return next;
    });
    setDeleteTarget(null);
    notify("success", `Deleted “${resource.title}”.`);
    loadResources({ silent: true });
  };

  // Filter options are built from the data, so new sheet values show up automatically.
  const subOptions = useMemo(
    () => ["All", ...new Set(resources.flatMap((r) => r.subCategories))],
    [resources],
  );

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return resources
      .filter((r) => {
        if (activeSub !== "All" && !r.subCategories.includes(activeSub))
          return false;
        if (!query) return true;

        const haystack = [
          r.title,
          r.description,
          getHostname(r.url),
          ...r.subCategories,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort(SORTS[sortKey].fn);
  }, [resources, searchQuery, activeSub, sortKey]);

  const hasFilters = searchQuery || activeSub !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setActiveSub("All");
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="dev-resources"
        className="py-20 relative overflow-hidden bg-[#000000]"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(140,252,251,0.08),transparent_65%)]"
          aria-hidden="true"
        />

        <div className="container mx-auto px-6 min-h-[70vh] relative z-10">
          {/* Header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-display font-semibold mb-4 text-white">
              Developer Resources
            </h2>
            <p className="text-[#c2ccaa] max-w-2xl mx-auto">
              Hand-picked tools, libraries, and references. Search by name, or
              filter by category.
            </p>
            <button
              type="button"
              onClick={openAdd}
              aria-haspopup="dialog"
              className="mt-6 inline-flex items-center gap-2 py-2.5 px-5 rounded-full bg-[#8cfcfb] text-black font-semibold hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add resource
            </button>
          </motion.div>

          {/* Search + sort */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6">
            <div className="relative flex-1">
              <svg
                viewBox="0 0 20 20"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 fill-none stroke-[#c2ccaa]/60"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14l4 4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                aria-label="Search resources"
                placeholder="Search by name, category, or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a0a0a] border border-[#c2ccaa]/30 rounded-full py-3 pl-12 pr-11 text-white placeholder:text-[#c2ccaa]/50 focus:outline-none focus:border-[#8cfcfb] focus:ring-1 focus:ring-[#8cfcfb] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-[#c2ccaa] hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb]"
                >
                  &times;
                </button>
              )}
            </div>

            <select
              aria-label="Sort resources"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="bg-[#1a0a0a] border border-[#c2ccaa]/30 rounded-full py-3 px-5 text-white focus:outline-none focus:border-[#8cfcfb] focus:ring-1 focus:ring-[#8cfcfb]"
            >
              {Object.entries(SORTS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Filters (only shown once data has loaded) */}
          {!loading && !error && resources.length > 0 && (
            <div className="max-w-4xl mx-auto mb-8 space-y-3">
              {subOptions.length > 2 && (
                <div
                  className="flex flex-wrap justify-center gap-2"
                  role="group"
                  aria-label="Filter by sub-category"
                >
                  {subOptions.map((sub) => (
                    <FilterChip
                      key={sub}
                      active={activeSub === sub}
                      onClick={() => setActiveSub(sub)}
                    >
                      {sub}
                    </FilterChip>
                  ))}
                </div>
              )}
              <p
                className="text-center text-sm text-[#c2ccaa]/70"
                aria-live="polite"
              >
                Showing {filteredResources.length} of {resources.length}{" "}
                resources
                {hasFilters && (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="underline underline-offset-2 text-[#8cfcfb] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8cfcfb] rounded"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              aria-busy="true"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center" role="alert">
              <p className="text-xl text-red-400 mb-2">{error}</p>
              <button
                type="button"
                onClick={() => loadResources()}
                className="text-[#8cfcfb] underline underline-offset-2 hover:text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredResources.map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    index={index}
                    onOpen={setSelectedResource}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    isDeleting={deletingId === resource.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-xl text-[#c2ccaa] mb-3">
                {resources.length === 0
                  ? "No resources have been added yet."
                  : searchQuery
                    ? `No resources match "${searchQuery}".`
                    : "No resources in this category yet."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[#8cfcfb] underline underline-offset-2 hover:text-white"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedResource && (
            <ResourceModal
              key={selectedResource.id}
              resource={selectedResource}
              onClose={closeModal}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editing && (
            <ResourceFormModal
              key={editing.resource ? `edit-${editing.resource.id}` : "add"}
              resource={editing.resource}
              subOptions={subOptions}
              takenUrls={takenUrls}
              onClose={() => setEditing(null)}
              onSubmit={handleSave}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteTarget && (
            <DeleteConfirmModal
              key={`delete-${deleteTarget.id}`}
              resource={deleteTarget}
              onClose={() => setDeleteTarget(null)}
              onConfirm={handleDelete}
            />
          )}
        </AnimatePresence>

        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </section>
    </MotionConfig>
  );
};

export default DevResAdmin;