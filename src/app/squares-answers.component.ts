import { AES, Utf8 } from 'crypto-es';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { trigger, style, transition, animate, keyframes } from '@angular/animations';
import { faArrowLeft, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { waitForElement } from 'src/helpers/utils';
import { DecryptedPuzzleResponse, DisplayMode, PuzzleResponse, Word } from 'src/models';

@Component({
    standalone: true,
    selector: 'squares-answers',
    templateUrl: './squares-answers.component.html',
    styleUrls: ['./squares-answers.component.scss'],
    imports: [CommonModule, FontAwesomeModule],
    animations: [
        trigger('showWords', [
            transition(':enter', [
                animate(
                    '0.3s',
                    keyframes([
                        style({ display: 'none', height: '0px', opacity: 0, offset: 0 }),
                        style({ display: 'none', height: '0px', opacity: 0, offset: 0.5 }),
                        style({ display: 'block', height: '90px', opacity: 0, offset: 0.51 }),
                        style({ display: 'block', height: '200px', opacity: 1, offset: 1 })
                    ])
                )
            ]),
            transition(':leave', [animate('0.15s', style({ height: '80px' }))])
        ]),
        trigger('showMode', [
            transition(':enter', [
                animate(
                    '0.3s',
                    keyframes([
                        style({ display: 'none', height: '0px', opacity: 0, offset: 0 }),
                        style({ display: 'none', height: '0px', opacity: 0, offset: 0.5 }),
                        style({ display: 'block', height: '90px', opacity: 0, offset: 0.51 }),
                        style({ display: 'block', height: '90px', opacity: 1, offset: 1 })
                    ])
                )
            ]),
            transition(':leave', [animate('0.15s', style({ opacity: 0 }))])
        ]),
        trigger('showMenu', [transition(':enter', [style({ opacity: 0 }), animate('0.15s 0.15s', style({ opacity: 1 }))]), transition(':leave', [animate('0.15s', style({ opacity: 0 }))])])
    ]
})
export class SquaresAnswersComponent implements OnInit, OnDestroy {
    private static readonly SECRET = '8C5a9o2Z8zjmCLHB';
    private static readonly START_DATE = new Date('2024-02-28T00:00:00+02:00');
    private static readonly DAY_MS = 1000 * 60 * 60 * 24;
    private readonly selectors = {
        wordsContainer: '#root .container .desktop__right .foundwords__container-desktop-inner',
        foundWordElements: '.foundwords__element'
    };
    protected readonly DisplayMode = DisplayMode;

    get words(): Word[] {
        return this.mode === DisplayMode.BonusWords ? this.bonusWords : this.officialWords;
    }

    isInit = false;
    showMenu = false;
    mode: DisplayMode = DisplayMode.Menu;
    officialWords: Word[] = [];
    bonusWords: Word[] = [];
    foundWords = new Set<string>();
    foundBonusWords = new Set<string>();
    mutationObserver: MutationObserver | undefined;
    scheduledUpdate = false;

    constructor(
        private httpClient: HttpClient,
        private changeDetectorRef: ChangeDetectorRef,
        library: FaIconLibrary
    ) {
        library.addIcons(faXmark, faMagnifyingGlass, faArrowLeft);
    }

    ngOnInit(): void {
        void this.initWords();
        void this.initMutationObserver();
    }

    private async initWords(): Promise<void> {
        const now = Date.now();
        const difference = Math.abs(now - SquaresAnswersComponent.START_DATE.getTime());
        const offset = Math.floor(difference / SquaresAnswersComponent.DAY_MS);

        const url = `https://squares.org/api/v1/puzzle/daily?offset=${offset}`;
        const puzzleResponse = await firstValueFrom(this.httpClient.get<PuzzleResponse>(url));

        const decryptedBytes = AES.decrypt(puzzleResponse.puzzles, SquaresAnswersComponent.SECRET);
        const decrypted = Utf8.stringify(decryptedBytes);
        const decryptedPuzzleResponse = JSON.parse(decrypted) as DecryptedPuzzleResponse[];

        const puzzle = decryptedPuzzleResponse.reduce((acc, next) => (next.id > acc.id ? next : acc));
        this.officialWords = this.mapAndSortWords(puzzle.words);
        this.bonusWords = this.mapAndSortWords(puzzle.optionalWords);
        this.changeDetectorRef.detectChanges();
    }

    private async initMutationObserver(): Promise<void> {
        const target = await waitForElement(this.selectors.wordsContainer);
        this.updateWords();
        this.mutationObserver = new MutationObserver(() => {
            if (!this.scheduledUpdate) {
                this.scheduledUpdate = true;
                requestAnimationFrame(() => {
                    this.scheduledUpdate = false;
                    this.updateWords();
                });
            }
        });
        this.mutationObserver.observe(target, {
            childList: true,
            subtree: true
        });
        this.isInit = true;
        this.changeDetectorRef.detectChanges();
    }

    private mapAndSortWords(words: string[]): Word[] {
        return [...words].sort((a, b) => b.length - a.length || a.localeCompare(b)).map((x) => ({ word: x, found: false }));
    }

    private updateWords(): void {
        const wordDivs = document.querySelectorAll<HTMLDivElement>(this.selectors.foundWordElements);
        if (wordDivs.length === this.foundWords.size + this.foundBonusWords.size) return;

        wordDivs.forEach((x) => {
            const text = x.innerText.trim();
            const wordMatch = this.officialWords.find((x) => x.word === text);
            const bonusWordMatch = this.bonusWords.find((x) => x.word === text);

            if (wordMatch && !this.foundWords.has(text)) {
                this.foundWords.add(text);
                wordMatch.found = true;
            }

            if (bonusWordMatch && !this.foundBonusWords.has(text)) {
                this.foundBonusWords.add(text);
                bonusWordMatch.found = true;
            }
        });

        this.officialWords = [...this.officialWords];
        this.bonusWords = [...this.bonusWords];
        this.changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.mutationObserver?.disconnect();
    }
}
