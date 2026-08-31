import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BLOGS, UI } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-blogs',
  styleUrl: './blogs.scss',
  templateUrl: './blogs.html',
})
export class Blogs {
  protected readonly content = BLOGS;
  protected readonly ui = UI;
}
