"use client";

import { LockIcon } from "lucide-react";
import { useActionState } from "react";
import { type UnlockState, unlock } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogHeader, DialogPanel, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function PasswordGate({ slug, clientName }: { slug: string; clientName: string }) {
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlock.bind(null, slug), {});

  return (
    <Dialog open disablePointerDismissal onOpenChange={() => {}}>
      <DialogPopup className="gate-dialog sm:max-w-sm" showCloseButton={false} bottomStickOnMobile={false}>
        <DialogHeader className="gap-2">
          <span className="mb-2 flex size-9 items-center justify-center rounded-full border text-muted-foreground">
            <LockIcon className="size-4" />
          </span>
          <DialogTitle className="font-normal text-2xl tracking-tight">{clientName}</DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed">
            Digite a senha de acesso para acompanhar a evolução da consultoria.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <Form action={action} errors={state.error ? { password: state.error } : {}} className="flex flex-col gap-4">
            <Field name="password">
              <FieldLabel>Senha</FieldLabel>
              <Input name="password" type="password" autoComplete="current-password" autoFocus required />
              <FieldError match="valueMissing">Informe a senha.</FieldError>
              <FieldError />
            </Field>
            <Button type="submit" loading={pending} className="w-full">
              Entrar
            </Button>
          </Form>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
