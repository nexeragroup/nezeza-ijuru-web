import { Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  standalone: false,
  styleUrl: './about-page.css',
  templateUrl: './about-page.html',
})
export class AboutPage {
  readonly values = [
    {
      icon: 'fa-cross',
      title: 'Reconcile',
      text: 'Proclaim Jesus Christ and call people to repentance, faith, and reconciliation with God through the Gospel.',
    },
    {
      icon: 'fa-seedling',
      title: 'Grow',
      text: 'Nurture believers in God’s Word so that salvation grows into spiritual maturity, conviction, and faithful discipleship.',
    },
    {
      icon: 'fa-lightbulb',
      title: 'Reveal',
      text: 'Encourage lives in which Christ becomes visible through character, choices, relationships, service, influence, and fruit.',
    },
  ] as const;

  readonly journey = [
    {
      year: '2017',
      title: 'Nezeza Ijuru begins',
      text: 'Zion Temple Kimironko launches Nezeza Ijuru as an evangelism mission inspired by Luke 15:10 and the Great Commission.',
    },
    {
      year: '2025',
      title: 'Nine editions of Gospel mission',
      text: 'The ninth edition continues the journey through evangelism, charity, youth empowerment, families, worship, and revival activities.',
    },
    {
      year: '2026',
      title: 'A decade of Nezeza Ijuru',
      text: 'The tenth edition carries the theme “The Seed Within: Christ Revealed,” calling people back to God’s Word and to lives that bear Christlike fruit.',
    },
  ] as const;

  readonly leaders = [
    {
      name: 'Apostle Dr. Paul M. Gitwaza',
      role: 'Founder, Authentic Word Ministries',
      text: 'Apostle Dr. Paul M. Gitwaza is the founder of Authentic Word Ministries, the wider ministry family from which Zion Temple Celebration Center and its parishes, including Zion Temple Kimironko, carry their ministry.',
      image: '/images/gitwaza.jpg',
      imagePosition: '50% 30%',
    },

    {
      name: 'Pastor Didier Habimana',
      role: 'Senior Pastor, Zion Temple Kimironko',
      text: 'Pastor Didier Habimana serves as Senior Pastor of Zion Temple Kimironko, the local parish from which Nezeza Ijuru was initiated and continues to carry its evangelism and discipleship mission.',
      image: '/images/didier.jpg',
      imagePosition: '58% 36%',
    },

    // {
    //   name: 'Jean Morris Ndamukunda',
    //   role: 'Lead Coordinator, Nezeza Ijuru',
    //   text: 'Jean Morris Ndamukunda serves as Lead Coordinator of Nezeza Ijuru, supporting the planning and coordination of its different programs, outreaches, gatherings, and annual edition.',
    //   image: '/images/jean-morris.jpg',
    //   imagePosition: '50% 30%',
    // },
  ] as const;
}
