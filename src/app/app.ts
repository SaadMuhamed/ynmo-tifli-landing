import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiteHeader } from './sections/site-header/site-header';
import { Hero } from './sections/hero/hero';
import { Journey } from './sections/journey/journey';
import { FeaturesCarousel } from './sections/features-carousel/features-carousel';
import { Specialists } from './sections/specialists/specialists';
import { ScreeningTools } from './sections/screening-tools/screening-tools';
import { WhyUs } from './sections/why-us/why-us';
import { Testimonials } from './sections/testimonials/testimonials';
import { Blogs } from './sections/blogs/blogs';
import { Partners } from './sections/partners/partners';
import { SecurityBanner } from './sections/security-banner/security-banner';
import { SiteFooter } from './sections/site-footer/site-footer';
import { WhatsappFab } from './sections/whatsapp-fab/whatsapp-fab';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeader,
    Hero,
    Journey,
    FeaturesCarousel,
    Specialists,
    ScreeningTools,
    WhyUs,
    Testimonials,
    Blogs,
    Partners,
    SecurityBanner,
    SiteFooter,
    WhatsappFab,
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
