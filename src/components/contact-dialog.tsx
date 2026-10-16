"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const FORM_ID = "contact-form";

// Hairline-underlined text button, matching the quiet style of the stage.
const quiet =
  "h-auto rounded-none border-0 px-0 pb-1.5 font-normal text-[15px] text-muted-foreground no-underline shadow-[inset_0_-1px_0_var(--hair)] transition-[color,box-shadow] duration-300 hover:text-foreground hover:no-underline hover:shadow-[inset_0_-1px_0_var(--hair-hi)] sm:h-auto sm:text-[15px]";

export function ContactDialog() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (sentTo !== null) {
    return (
      <p className="step-in text-center text-muted-foreground text-[15px]">
        Obrigado{sentTo ? `, ${sentTo}` : ""}. Retornaremos em breve.
      </p>
    );
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="link" className={quiet} />}>
        Vamos conversar sobre o seu projeto
      </DialogTrigger>

      <DialogPopup className="contact-dialog sm:max-w-md">
        <div className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="gap-2">
            <DialogTitle className="font-normal text-2xl tracking-tight">
              Vamos conversar.
            </DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed">
              Conte um pouco sobre o desafio da sua empresa. Respondemos em até
              um dia útil.
            </DialogDescription>
          </DialogHeader>

          <DialogPanel>
            <Form
              id={FORM_ID}
              className="flex flex-col gap-5"
              onFormSubmit={(values) => {
                // TODO: send to the contact backend.
                setSentTo(String(values.name ?? "").trim().split(/\s+/)[0] ?? "");
              }}
            >
              <Field name="name">
                <FieldLabel>Nome</FieldLabel>
                <Input name="name" autoComplete="name" required />
                <FieldError match="valueMissing">Informe o seu nome.</FieldError>
              </Field>
              <Field name="email">
                <FieldLabel>E-mail de trabalho</FieldLabel>
                <Input
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nome@empresa.com.br"
                  required
                />
                <FieldError match="valueMissing">Informe o seu e-mail.</FieldError>
                <FieldError match="typeMismatch">Digite um e-mail válido.</FieldError>
              </Field>
              <Field name="company">
                <FieldLabel>Empresa</FieldLabel>
                <Input name="company" autoComplete="organization" />
              </Field>
              <Field name="message">
                <FieldLabel>Como podemos ajudar?</FieldLabel>
                <Textarea name="message" rows={4} />
              </Field>
            </Form>
          </DialogPanel>

          <DialogFooter variant="bare">
            <DialogClose render={<Button variant="ghost" />}>Fechar</DialogClose>
            <Button type="submit" form={FORM_ID}>
              Enviar
            </Button>
          </DialogFooter>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
