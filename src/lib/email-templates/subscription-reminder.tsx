import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props { nome?: string; tipo?: 'd-3' | 'd0' | 'd+1'; link?: string }

const copy = {
  'd-3': { h: 'Sua assinatura vence em 3 dias', t: 'Renove agora para manter suas lojas no ar sem interrupção.' },
  d0: { h: 'Sua assinatura vence hoje', t: 'Renove hoje para que suas lojas continuem funcionando.' },
  'd+1': { h: 'Sua assinatura venceu', t: 'Suas lojas foram pausadas. Renove para reativar tudo na hora.' },
}

const Email = ({ nome, tipo = 'd0', link = 'https://afiliaplace.site' }: Props) => {
  const c = copy[tipo] ?? copy.d0
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>{c.h}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}><Text style={brand}>AfiliaPlace</Text></Section>
          <Section style={content}>
            <Heading style={h1}>{nome ? `${nome}, ` : ''}{c.h.charAt(0).toLowerCase() + c.h.slice(1)}</Heading>
            <Text style={text}>{c.t}</Text>
            <Section style={{ textAlign: 'center', margin: '24px 0' }}><Button href={link} style={button}>Renovar meu plano Mensal</Button></Section>
          </Section>
          <Text style={footer}>AfiliaPlace · afiliaplace.site</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => (copy[d['tipo'] as keyof typeof copy] ?? copy.d0).h,
  displayName: 'Aviso de vencimento',
  previewData: { nome: 'Ana', tipo: 'd-3', link: 'https://afiliaplace.site' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', margin: 0, padding: '20px 0' }
const container = { maxWidth: '560px', margin: '0 auto', border: '1px solid #ececec', borderRadius: '16px', overflow: 'hidden' as const }
const header = { background: '#e8a317', padding: '18px 0', textAlign: 'center' as const }
const brand = { color: '#1f1f1f', fontSize: '22px', fontWeight: 'bold', margin: 0 }
const content = { padding: '28px 28px 8px' }
const h1 = { color: '#1f1f1f', fontSize: '22px', margin: '0 0 10px' }
const text = { color: '#4a4a4a', fontSize: '15px', lineHeight: '22px' }
const button = { background: '#e8a317', color: '#1f1f1f', borderRadius: '12px', padding: '15px 30px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none' }
const footer = { color: '#9a9a9a', fontSize: '12px', textAlign: 'center' as const, padding: '0 0 20px' }
