import { Injectable, signal } from '@angular/core';
import { FRENCH_TRANSLATIONS, Language } from '../data/translations';
import { ITALIAN_TRANSLATIONS } from '../data/italian-translations';

const LANGUAGE_STORAGE_KEY = 'omarphone-language';
const LANGUAGE_SEQUENCE: Language[] = ['en', 'fr', 'it'];
const TRANSLATIONS: Partial<Record<Language, Record<string, string>>> = {
  fr: FRENCH_TRANSLATIONS,
  it: ITALIAN_TRANSLATIONS,
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly language = signal<Language>(this.getInitialLanguage());
  private readonly textOriginals = new WeakMap<Text, string>();
  private readonly attributeOriginals = new WeakMap<Element, Map<string, string>>();

  toggleLanguage(): void {
    this.setLanguage(this.getNextLanguage());
  }

  setLanguage(language: Language): void {
    this.language.set(language);
    this.persistLanguage(language);
    this.applyToDocument();
  }

  translate(value: string): string {
    const dictionary = TRANSLATIONS[this.language()];
    return dictionary?.[this.normalize(value)] ?? value;
  }

  applyToDocument(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.lang = this.language();
    this.translateElement(document.body);
  }

  translateElement(root: HTMLElement | null): void {
    if (!root) {
      return;
    }

    this.translateAttributes(root);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node.textContent?.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes: Text[] = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text);
    }

    for (const node of textNodes) {
      this.translateTextNode(node);
    }

    for (const element of Array.from(root.querySelectorAll<HTMLElement>('[placeholder], [aria-label], [title]'))) {
      this.translateAttributes(element);
    }
  }

  private translateTextNode(node: Text): void {
    const original = this.textOriginals.get(node) ?? node.textContent ?? '';
    if (!this.textOriginals.has(node)) {
      this.textOriginals.set(node, original);
    }
    node.textContent = this.language() === 'en' ? original : this.translatePreservingWhitespace(original);
  }

  private translateAttributes(element: HTMLElement): void {
    this.translateAttribute(element, 'placeholder');
    this.translateAttribute(element, 'aria-label');
    this.translateAttribute(element, 'title');
  }

  private translateAttribute(element: HTMLElement, attribute: string): void {
    const current = element.getAttribute(attribute);
    if (!current) {
      return;
    }

    const originals = this.getAttributeOriginals(element);
    const original = originals.get(attribute) ?? current;
    if (!originals.has(attribute)) {
      originals.set(attribute, original);
    }

    element.setAttribute(attribute, this.language() === 'en' ? original : this.translatePreservingWhitespace(original));
  }

  private getAttributeOriginals(element: HTMLElement): Map<string, string> {
    const existing = this.attributeOriginals.get(element);
    if (existing) {
      return existing;
    }

    const originals = new Map<string, string>();
    this.attributeOriginals.set(element, originals);
    return originals;
  }

  private translatePreservingWhitespace(value: string): string {
    const match = value.match(/^(\s*)(.*?)(\s*)$/s);
    if (!match) {
      return this.translate(value);
    }

    return `${match[1]}${this.translate(match[2])}${match[3]}`;
  }

  private normalize(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  private getInitialLanguage(): Language {
    if (typeof window === 'undefined') {
      return 'en';
    }

    try {
      const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return this.isLanguage(saved) ? saved : 'en';
    } catch {
      return 'en';
    }
  }

  private getNextLanguage(): Language {
    const currentIndex = LANGUAGE_SEQUENCE.indexOf(this.language());
    return LANGUAGE_SEQUENCE[(currentIndex + 1) % LANGUAGE_SEQUENCE.length];
  }

  private isLanguage(value: string | null): value is Language {
    return value === 'en' || value === 'fr' || value === 'it';
  }

  private persistLanguage(language: Language): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // The current page still changes language if storage is blocked.
    }
  }
}
