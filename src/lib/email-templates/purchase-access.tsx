import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props { email?: string; password?: string; plan?: string }

const SITE = 'https://afiliaplace.site'

const Email = ({ email, password, plan }: Props) => {
  const planName = plan || 'AfiliaPlace'
  const lifetime = /vital/i.test(planName)
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Seu login e senha da AfiliaPlace estão aqui</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img src={`${SITE}/mascot.png`} width="56" height="56" alt="AfiliaPlace" style={{ margin: '0 auto' }} />
            <Text style={brand}>AfiliaPlace</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Bem-vindo(a) à AfiliaPlace!</Heading>
            <Text style={badge}>Plano {planName}{lifetime ? ' · sem vencimento' : ''}</Text>
            <Text style={text}>Pagamento aprovado. Seu acesso já está liberado — confira seus dados de entrada:</Text>

            <Section style={box}>
              <Text style={label}>Login</Text>
              <Text style={value}>{email || 'o e-mail da compra'}</Text>
              {password ? (
                <>
                  <Text style={label}>Senha</Text>
                  <Text style={pass}>{password}</Text>
                </>
              ) : (
                <Text style={text}>
                  Use sua senha atual. Esqueceu? <Link href={`${SITE}/auth`} style={link}>Esqueci minha senha</Link>
                </Text>
              )}
            </Section>

            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Button href={`${SITE}/auth`} style={button}>Acessar minha conta</Button>
            </Section>

            <Text style={h2}>Primeiros passos</Text>
            <Text style={step}>1. Conecte sua conta do Mercado Livre em Integrações.</Text>
            <Text style={step}>2. Explore os produtos em alta na aba Produtos.</Text>
            <Text style={step}>3. Divulgue com os grupos e scripts prontos.</Text>

            <Section style={warn}>
              <Text style={warnText}>🔒 Troque sua senha em Meu Perfil e não compartilhe estes dados.</Text>
            </Section>
          </Section>

          <Text style={footer}>AfiliaPlace · <Link href={SITE} style={footerLink}>afiliaplace.site</Link></Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: 'Seu acesso à AfiliaPlace chegou 🎉 — login e senha dentro',
  displayName: 'Acesso após a compra',
  previewData: { email: 'cliente@gmail.com', password: 'Ab3k-9Qz2-Lm7p', plan: 'Vitalício' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', margin: 0, padding: '20px 0' }
const container = { maxWidth: '560px', margin: '0 auto', border: '1px solid #ececec', borderRadius: '16px', overflow: 'hidden' as const }
const header = { background: '#e8a317', padding: '22px 0 14px', textAlign: 'center' as const }
const brand = { color: '#1f1f1f', fontSize: '22px', fontWeight: 'bold', margin: '6px 0 0' }
const content = { padding: '28px 28px 8px' }
const h1 = { color: '#1f1f1f', fontSize: '24px', margin: '0 0 10px' }
const badge = { display: 'inline-block', background: '#fff4dc', color: '#a86f00', fontSize: '13px', fontWeight: 'bold', borderRadius: '999px', padding: '4px 12px', margin: '0 0 12px' }
const text = { color: '#4a4a4a', fontSize: '15px', lineHeight: '22px' }
const box = { background: '#f5f5f3', border: '1px solid #ececec', borderRadius: '12px', padding: '14px 20px', margin: '16px 0' }
const label = { color: '#8a8a8a', fontSize: '12px', letterSpacing: '1px', margin: '8px 0 0', textTransform: 'uppercase' as const }
const value = { color: '#1f1f1f', fontSize: '17px', fontWeight: 'bold', margin: '2px 0 6px' }
const pass = { ...value, fontFamily: 'Courier New, monospace', fontSize: '20px', letterSpacing: '1px' }
const link = { color: '#c98a00', fontWeight: 'bold' }
const button = { background: '#e8a317', color: '#1f1f1f', borderRadius: '12px', padding: '15px 30px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none' }
const h2 = { color: '#1f1f1f', fontSize: '16px', fontWeight: 'bold', margin: '8px 0 6px' }
const step = { color: '#4a4a4a', fontSize: '14px', lineHeight: '20px', margin: '4px 0' }
const warn = { background: '#fafafa', borderLeft: '3px solid #e8a317', borderRadius: '8px', padding: '4px 14px', margin: '20px 0' }
const warnText = { color: '#5a5a5a', fontSize: '13px', margin: '8px 0' }
const footer = { color: '#9a9a9a', fontSize: '12px', textAlign: 'center' as const, padding: '0 0 20px' }
const footerLink = { color: '#9a9a9a' }
