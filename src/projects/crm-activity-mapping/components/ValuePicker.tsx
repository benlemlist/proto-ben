// The one control of the simplified Field Mapping: what a Salesforce field receives.
// A lemlist field, a fixed value, or a different value per activity: one dropdown, one place.
import { useState } from "react";
import {
  Select, DropdownMenu, DropdownMenuSearch, DropdownMenuList, DropdownMenuItem, DropdownMenuHeading,
  DropdownMenuDelimiter, DropdownMenuEmpty, TextInput,
} from "@l3mpire/ui";
import { faPenOutline, faListCheckOutline, faTextOutline } from "@l3mpire/icons";
import { LEMLIST_FIELDS, LEMLIST_GROUPS, isCompatible, lemlistField, type SfField, type Source } from "../data";

function sourceLabel(source: Source): string | undefined {
  switch (source.kind) {
    case "field": return lemlistField(source.field)?.label;
    case "fixed": return "Fixed value";
    case "perActivity": {
      const n = new Set(Object.values(source.values).filter(Boolean)).size;
      return `Per activity · ${n} value${n > 1 ? "s" : ""}`;
    }
    default: return undefined;
  }
}

export function ValuePicker({ sf, source, onChange, disabled }: {
  sf: SfField; source: Source; activityCount: number; onChange: (s: Source) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const pick = (s: Source) => { onChange(s); setOpen(false); setQ(""); };
  const fields = LEMLIST_FIELDS.filter((f) => f.label.toLowerCase().includes(q.toLowerCase()));
  const icon = source.kind === "fixed" ? faPenOutline : source.kind === "perActivity" ? faListCheckOutline : undefined;

  return (
    <Select
      size="md"
      value={sourceLabel(source)}
      placeholder="Choose a value"
      icon={icon}
      isOpen={open}
      onOpenChange={(o) => { setOpen(o); if (!o) setQ(""); }}
      disabled={disabled}
    >
      <DropdownMenu className="w-[340px]">
        <DropdownMenuSearch value={q} onValueChange={setQ} onClear={() => setQ("")} placeholder="Search a lemlist field" />
        <DropdownMenuList>
          {!q && (
            <>
              <DropdownMenuItem
                icon={faPenOutline}
                label="Fixed value"
                description={`The same ${sf.label} on every activity`}
                selected={source.kind === "fixed"}
                onClick={() => pick({ kind: "fixed", value: source.kind === "fixed" ? source.value : sf.options?.[0] ?? "" })}
              />
              <DropdownMenuItem
                icon={faListCheckOutline}
                label="A value per activity"
                description="e.g. Call for calls, Email for emails"
                selected={source.kind === "perActivity"}
                onClick={() => pick({ kind: "perActivity", values: source.kind === "perActivity" ? source.values : {} })}
              />
              <DropdownMenuDelimiter bleed />
            </>
          )}
          {fields.length === 0 && <DropdownMenuEmpty>No lemlist field matches</DropdownMenuEmpty>}
          {LEMLIST_GROUPS.map((g) => {
            const inGroup = fields.filter((f) => f.group === g);
            if (!inGroup.length) return null;
            return (
              <div key={g} className="contents">
                <DropdownMenuHeading className="[&_span]:normal-case">{g}</DropdownMenuHeading>
                {inGroup.map((f) => {
                  const ok = isCompatible(f, sf);
                  return (
                    <DropdownMenuItem
                      key={f.id}
                      icon={faTextOutline}
                      label={f.label}
                      sublabel={ok ? f.example : `Not a ${sf.type} field`}
                      disabled={!ok}
                      selected={source.kind === "field" && source.field === f.id}
                      onClick={() => ok && pick({ kind: "field", field: f.id })}
                    />
                  );
                })}
              </div>
            );
          })}
        </DropdownMenuList>
      </DropdownMenu>
    </Select>
  );
}

/** Value input for a fixed value: the picklist's values, or free text. */
export function FixedInput({ sf, value, onChange, size = "md" }: { sf: SfField; value: string; onChange: (v: string) => void; size?: "sm" | "md" }) {
  const [open, setOpen] = useState(false);
  if (!sf.options) return <FreeText value={value} onChange={onChange} size={size} />;
  return (
    <Select size={size} value={value || undefined} placeholder="Choose a value" isOpen={open} onOpenChange={setOpen}>
      <DropdownMenu className="w-[220px]">
        <DropdownMenuList>
          <DropdownMenuItem label="Leave empty" selected={!value} onClick={() => { onChange(""); setOpen(false); }} />
          <DropdownMenuDelimiter bleed />
          {sf.options.map((o) => <DropdownMenuItem key={o} label={o} selected={o === value} onClick={() => { onChange(o); setOpen(false); }} />)}
        </DropdownMenuList>
      </DropdownMenu>
    </Select>
  );
}

function FreeText({ value, onChange, size }: { value: string; onChange: (v: string) => void; size: "sm" | "md" }) {
  return <TextInput size={size} value={value} placeholder="Type a value" onChange={(e) => onChange(e.target.value)} />;
}
