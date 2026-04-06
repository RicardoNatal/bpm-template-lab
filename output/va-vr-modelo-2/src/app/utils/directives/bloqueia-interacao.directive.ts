import { Directive, ElementRef, Input } from "@angular/core";

@Directive({
  selector: '[appBlockInteraction]'
})
export class BlockInteractionDirective {
  @Input() set appBlockInteraction(value: boolean) {
    this.el.nativeElement.style.pointerEvents = value ? 'none' : 'auto';
    this.el.nativeElement.style.opacity = value ? '0.4' : '1';
  }

  constructor(private el: ElementRef) {}
}