import { Component } from '@angular/core';
import { GivingMethod } from '../../interfaces/give.interface';

@Component({
  selector: 'app-give-page',
  standalone: false,
  styleUrl: './give-page.css',
  templateUrl: './give-page.html',
})
export class GivePage {
  readonly givingMethods: GivingMethod[] = [
    {
      id: 'momo',
      name: 'MTN Mobile Money',
      shortName: 'MoMo',
      icon: 'fa-mobile-screen-button',
      badge: 'Popular in Rwanda',
      description: 'Give quickly and securely using MTN Mobile Money from your phone.',
      details: [
        {
          label: 'Name',
          value: 'AWM Zion Temple Kimironko',
        },
        {
          label: 'Code',
          value: '079581',
        },
      ],
      actionLabel: 'Get MoMo details',
      href: 'mailto:info@nezezaijuru.org?subject=MTN%20MoMo%20Giving%20Details',
      featured: true,
    },
    {
      id: 'bank',
      name: 'Urwego Bank Plc',
      shortName: 'Bank',
      icon: 'fa-building-columns',
      badge: 'Local & international',
      description: 'Send your offering directly through a local or international bank transfer.',
      details: [
        {
          label: 'Name',
          value: 'Zion Temple Kimironko',
        },
        {
          label: 'Account Number (RWF)',
          value: '1 116 303 140 117',
        },
        {
          label: 'Account Number (USD)',
          value: '1 116 3031 40125',
        },
      ],
      actionLabel: 'Get bank details',
      href: 'mailto:info@nezezaijuru.org?subject=Bank%20Giving%20Details',
    },
    {
      id: 'worldremit',
      name: 'WorldRemit',
      shortName: 'WorldRemit',
      icon: 'fa-brands fa-w',
      badge: 'International',
      description: 'A convenient option for supporters giving from outside Rwanda.',
      details: [
        // {
        //   label: 'Method',
        //   value: 'WorldRemit',
        // },
        {
          label: 'Name',
          value: 'Zion Temple Kimironko',
        },
        {
          label: 'Number',
          value: '+250 782 636 233',
        },
      ],
      actionLabel: 'Request giving details',
      href: 'mailto:info@nezezaijuru.org?subject=Giving%20Details',
      featured: true,
    },
    {
      id: 'cash',
      name: 'Give in Person',
      shortName: 'In person',
      icon: 'fa-hand-holding-heart',
      badge: 'At our gatherings',
      description: 'You can also give during Nezeza Ijuru gatherings and ministry activities.',
      details: [
        {
          label: 'Method',
          value: 'Cash / in-person offering',
        },
        {
          label: 'Where',
          value: 'Nezeza Ijuru gatherings',
        },
      ],
      actionLabel: 'Contact the ministry',
      href: 'tel:+250788319899',
    },
  ];

  readonly impactAreas = [
    {
      icon: 'fa-cross',
      title: 'Gospel outreach',
      text: 'Help create spaces where people can hear the good news of Jesus and respond in faith.',
    },
    {
      icon: 'fa-people-group',
      title: 'Discipleship & families',
      text: 'Support teaching, mentoring, worship, and ministry that helps believers and families grow.',
    },
    {
      icon: 'fa-hand-holding-heart',
      title: 'Compassion in action',
      text: 'Strengthen practical care for people and communities facing real needs.',
    },
  ] as const;

  readonly steps = [
    {
      title: 'Choose how you want to give',
      text: 'Select Mobile Money, bank transfer, or an in-person offering.',
    },
    {
      title: 'Confirm the giving details',
      text: 'Use the verified ministry details for the payment channel you have selected.',
    },
    {
      title: 'Complete your offering',
      text: 'Send your gift through your preferred channel and keep your payment reference where applicable.',
    },
    {
      title: 'Stand with us in prayer',
      text: 'Beyond financial giving, continue praying for the Gospel mission and the people it reaches.',
    },
  ] as const;

  readonly commitments = [
    {
      title: 'Mission-focused',
      text: 'Offerings support the Gospel mission and its practical expression.',
    },
    {
      title: 'Verified channels',
      text: 'Giving channels are confirmed by the ministry team so you can give with confidence.',
    },
    {
      title: 'Responsible stewardship',
      text: 'Resources entrusted to the ministry are handled intentionally and with care.',
    },
    {
      title: 'Open conversation',
      text: 'You can always contact our team if you have questions about giving or the work it supports.',
    },
  ] as const;
}
