import { useFormState, FieldError } from "react-hook-form";

export default function FieldWrapper({ children, name }: { children: React.ReactNode; name: string }) {
    const { errors } = useFormState();
    const error = errors[name] as FieldError | undefined;

    return (
        <div className="field-wrapper flex flex-col gap-1.5">
            {children}
            {error?.message && (
                <p className="text-[12px] text-[#FF6B6B]">{error.message}</p>
            )}
        </div>
    );
};