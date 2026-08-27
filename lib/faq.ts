import { createServiceClient } from '@/lib/supabase/server'
import { getRates, type RateSettings } from '@/lib/rates'
import { contacts } from '@/lib/site'

export type FaqItem = { question: string; answer: string }

/**
 * Резервный список вопросов. Числа берутся из настроек базы,
 * чтобы ответы не расходились с ценами и правилами заезда.
 */
function fallbackFaq(s: RateSettings): FaqItem[] {
  return [
    {
      question: 'Сколько человек вмещает усадьба?',
      answer:
        'В доме четыре просторные спальни, каждая со своим санузлом. Уточните состав вашей компании при бронировании — мы подтвердим подходящее размещение.',
    },
    {
      question: 'Как далеко усадьба от Москвы и Петербурга?',
      answer:
        'Дорога из Москвы занимает около пяти часов, из Санкт-Петербурга — около четырёх. Усадьба находится в Новосокольническом районе Псковской области.',
    },
    {
      question: 'Что включено в стоимость аренды?',
      answer:
        'Дом сдаётся целиком. В нём есть оборудованная кухня, Wi-Fi и бельё; для отдыха на воде доступны лодка и сап-борды. Точные условия для выбранных дат подтвердим перед бронированием.',
    },
    {
      question: 'Можно ли приехать с домашними животными?',
      answer:
        'Возможность приезда с питомцем согласуйте заранее — сообщите об этом при отправке заявки.',
    },
    {
      question: 'Есть ли минимальный срок аренды?',
      answer:
        s.minimum_nights > 1
          ? `Для доступных сейчас тарифов минимальный срок — ${s.minimum_nights} ночи. Для праздников и отдельных дат условия могут отличаться.`
          : 'Минимальный срок зависит от выбранных дат. Актуальные условия покажет календарь, а окончательно их подтвердит администратор.',
    },
    {
      question: 'Как забронировать?',
      answer: `Выберите даты и отправьте заявку. Мы проверим доступность и подтвердим условия до оплаты. Быстрее всего ответим по телефону ${contacts.phoneLabel}.`,
    },
  ]
}

/** FAQ из базы; если таблица пуста — согласованный резервный список. */
export async function getFaq(): Promise<FaqItem[]> {
  const { settings } = await getRates()

  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('faq')
      .select('question, answer, sort_order')
      .order('sort_order', { ascending: true })

    if (data?.length) {
      return data.map((r) => ({ question: r.question, answer: r.answer }))
    }
  } catch {
    // тихо переходим на резервный список
  }

  return fallbackFaq(settings)
}
