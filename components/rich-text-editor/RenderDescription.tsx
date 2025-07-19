"use client";

import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import { JSONContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";
import { useMemo } from "react";
import parse from "html-react-parser";

export const RenderDescription = ({ json }: { json: JSONContent }) => {
  const output = useMemo(() => {
    return generateHTML(json, [
      StarterKit,
      // @ts-ignore
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ]);
  }, [json]);

  return <div className='prose dark:prose-invert prose-li:marker:text-primary'>{parse(output)}</div>;
};
