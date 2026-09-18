export type TestCase = { label: string; code: string; expected: string };
export type Exercise = {
  id: string; title: string; chapter: number; difficulty: 1 | 2 | 3 | 4;
  statement: string; signature: string; starter: string; example: [string, string];
  hint: string; solution: string; explanation: string; tests: TestCase[];
};
export const chapters = ['Fondamentaux', 'Tableaux et chaînes', 'Pointeurs et mémoire', 'Tris et recherche', 'Listes et arbres', 'Graphes et ensembles'];
const fn = (signature: string, body = '    // À compléter\n    return 0;') => `${signature} {\n${body}\n}\n`;
const test = (label: string, code: string, expected: string): TestCase => ({label, code, expected});
const scalar = (expr: string, expected: number): TestCase => test(expr, `printf("%d", ${expr});`, String(expected));
const arr = (a: number[]) => a.length ? a.join(', ') : '0';
const arrays = [[3,1,4,1,5], [], [7], [-5,-2,-9], [2,2,2], [5,4,3,2,1], [0,-1,1,0]];
const sortedTests = (name: string) => arrays.map(a => test(JSON.stringify(a), `int t[] = {${arr(a)}}; ${name}(t, ${a.length}); for (int i=0;i<${a.length};i++) printf("%d ",t[i]);`, [...a].sort((a,b)=>a-b).join(' ')));
const listType = 'typedef struct Cellule {\n    int valeur;\n    struct Cellule *suivante;\n} Cellule;\n\n';
const treeType = 'typedef struct Noeud {\n    int valeur;\n    struct Noeud *gauche, *droite;\n} Noeud;\n\n';
const treeSetup = 'Noeud a={1,NULL,NULL}, b={4,NULL,NULL}, c={3,&a,&b}, d={9,NULL,NULL}, r={6,&c,&d};';
export const exercises: Exercise[] = [
{
 id:'maximum', title:'Maximum de deux entiers', chapter:0, difficulty:1,
 statement:'Écrire une fonction qui renvoie le plus grand des deux entiers a et b. Les entiers peuvent être négatifs ou égaux.',
 signature:'int maximum(int a, int b)', starter:fn('int maximum(int a, int b)'), example:['maximum(3, 7)','7'],
 hint:'Comparer a et b, puis renvoyer la valeur appropriée avec return.',
 solution:fn('int maximum(int a, int b)', '    if (a > b) return a;\n    return b;'), explanation:'Une comparaison suffit. Temps et espace : O(1).',
 tests:[[3,7],[9,2],[-5,-2],[4,4],[0,-1],[-2147483647,2147483647]].map(([a,b])=>scalar(`maximum(${a}, ${b})`, Math.max(a,b)))
},
{
 id:'factorielle', title:'Factorielle', chapter:0, difficulty:1,
 statement:'Calculer n! à l’aide d’une boucle, pour 0 ≤ n ≤ 12. Par convention, 0! = 1.', signature:'int factorielle(int n)', starter:fn('int factorielle(int n)'), example:['factorielle(5)','120'],
 hint:'Initialiser un produit à 1 et multiplier successivement par les entiers de 2 à n.',
 solution:fn('int factorielle(int n)', '    int p = 1;\n    for (int k = 2; k <= n; k++) p *= k;\n    return p;'), explanation:'Après l’itération k, p vaut k!. Temps O(n), espace O(1).',
 tests:[0,1,2,5,8,12].map(n=>scalar(`factorielle(${n})`,Array.from({length:n},(_,i)=>i+1).reduce((a,b)=>a*b,1)))
},
{
 id:'pgcd', title:'Algorithme d’Euclide', chapter:0, difficulty:1,
 statement:'Calculer le PGCD de deux entiers naturels a et b par l’algorithme d’Euclide. On pose pgcd(0, 0) = 0.', signature:'int pgcd(int a, int b)', starter:fn('int pgcd(int a, int b)'), example:['pgcd(48, 18)','6'],
 hint:'Tant que b est non nul, remplacer (a, b) par (b, a % b).',
 solution:fn('int pgcd(int a, int b)', '    while (b != 0) {\n        int r = a % b;\n        a = b;\n        b = r;\n    }\n    return a;'), explanation:'Le PGCD est invariant à chaque itération. Le second argument décroît strictement. Temps logarithmique pour a, b > 0.',
 tests:[[48,18,6],[0,7,7],[7,0,7],[0,0,0],[17,13,1],[270,192,6]].map(([a,b,c])=>scalar(`pgcd(${a}, ${b})`,c))
},
{
 id:'puissance', title:'Exponentiation rapide', chapter:0, difficulty:2,
 statement:'Calculer a à la puissance n en O(log(n + 1)), pour n ≥ 0. On convient que a⁰ = 1, même si a = 0. Le résultat et les produits utiles tiennent dans un int.', signature:'int puissance(int a, int n)', starter:fn('int puissance(int a, int n)'), example:['puissance(3, 5)','243'],
 hint:'Si n est pair, aⁿ = (a²)ⁿ⸍². Si n est impair, extraire un facteur a. Ne pas calculer un carré inutile après la dernière étape.',
 solution:fn('int puissance(int a, int n)', '    int p = 1;\n    while (n > 0) {\n        if (n % 2) p *= a;\n        n /= 2;\n        if (n > 0) a *= a;\n    }\n    return p;'), explanation:'L’exposant est divisé par deux à chaque étape. Temps O(log(n + 1)), espace O(1). Les tests vérifient les valeurs, pas la complexité.',
 tests:[[3,5],[2,10],[-2,3],[-2,4],[0,0],[0,8],[1,1000000000],[2147483647,1]].map(([a,n])=>scalar(`puissance(${a}, ${n})`,a**n))
},
{
 id:'somme', title:'Somme d’un tableau', chapter:1, difficulty:2,
 statement:'Renvoyer la somme des n éléments du tableau t, sans modifier t. La somme du tableau vide est nulle. On suppose n ≥ 0 et la somme représentable par un int.', signature:'int somme(const int t[], int n)', starter:fn('int somme(const int t[], int n)'), example:['somme((int[]){3, -1, 4}, 3)','6'],
 hint:'Parcourir les indices de 0 inclus à n exclu et maintenir un accumulateur.',
 solution:fn('int somme(const int t[], int n)', '    int s = 0;\n    for (int i = 0; i < n; i++) s += t[i];\n    return s;'), explanation:'Temps O(n), espace supplémentaire O(1).',
 tests:arrays.map(a=>test(JSON.stringify(a),`int t[]={${arr(a)}}; printf("%d",somme(t,${a.length}));`,String(a.reduce((x,y)=>x+y,0))))
},
{
 id:'occurrences', title:'Compter les occurrences', chapter:1, difficulty:2,
 statement:'Compter le nombre d’occurrences de x parmi les n éléments de t, sans modifier le tableau. On suppose n ≥ 0.', signature:'int occurrences(const int t[], int n, int x)', starter:fn('int occurrences(const int t[], int n, int x)'), example:['occurrences((int[]){2, 1, 2, 2}, 4, 2)','3'],
 hint:'Incrémenter un compteur chaque fois que t[i] == x.',
 solution:fn('int occurrences(const int t[], int n, int x)', '    int c = 0;\n    for (int i = 0; i < n; i++)\n        if (t[i] == x) c++;\n    return c;'), explanation:'Un seul parcours : temps O(n), espace O(1).',
 tests:arrays.map(a=>test(`${JSON.stringify(a)}, x = 2`,`int t[]={${arr(a)}}; printf("%d",occurrences(t,${a.length},2));`,String(a.filter(x=>x===2).length)))
},
{
 id:'inverser', title:'Inverser un tableau', chapter:1, difficulty:2,
 statement:'Inverser sur place l’ordre des n éléments de t, en espace supplémentaire O(1). Le tableau peut être vide.', signature:'void inverser(int t[], int n)', starter:fn('void inverser(int t[], int n)','    // À compléter'), example:['{1, 2, 3, 4} après inverser(t, 4)','{4, 3, 2, 1}'],
 hint:'Échanger les éléments symétriques : t[i] et t[n - 1 - i], jusqu’au milieu.',
 solution:fn('void inverser(int t[], int n)', '    for (int i = 0; i < n / 2; i++) {\n        int tmp = t[i];\n        t[i] = t[n - 1 - i];\n        t[n - 1 - i] = tmp;\n    }'), explanation:'Chaque paire est échangée une seule fois. Temps O(n), espace O(1).',
 tests:arrays.map(a=>test(JSON.stringify(a),`int t[]={${arr(a)}}; inverser(t,${a.length}); for(int i=0;i<${a.length};i++) printf("%d ",t[i]);`,[...a].reverse().join(' ')))
},
{
 id:'palindrome', title:'Chaîne palindrome', chapter:1, difficulty:2,
 statement:'Renvoyer 1 si la chaîne s est un palindrome, 0 sinon. La comparaison est sensible à la casse. s est une chaîne ASCII terminée par le caractère nul. La chaîne vide est un palindrome. Ne pas utiliser strlen.', signature:'int palindrome(const char s[])', starter:fn('int palindrome(const char s[])'), example:['palindrome("radar")','1'],
 hint:'Déterminer la longueur, puis comparer les caractères situés à égale distance des extrémités.',
 solution:fn('int palindrome(const char s[])', '    int n = 0;\n    while (s[n] != \'\\0\') n++;\n    for (int i = 0; i < n / 2; i++)\n        if (s[i] != s[n - 1 - i]) return 0;\n    return 1;'), explanation:'Deux parcours linéaires au plus : temps O(n), espace O(1).',
 tests:['','a','radar','abba','abc','Radar','abca'].map(s=>scalar(`palindrome(${JSON.stringify(s)})`,s===[...s].reverse().join('')?1:0))
},
{
 id:'echanger', title:'Échanger par adresse', chapter:2, difficulty:2,
 statement:'Échanger les entiers pointés par a et b. Les deux pointeurs sont valides et peuvent désigner le même entier.', signature:'void echanger(int *a, int *b)', starter:fn('void echanger(int *a, int *b)','    // À compléter'), example:['a = 3, b = 7 ; echanger(&a, &b)','a = 7, b = 3'],
 hint:'Lire et écrire la valeur pointée avec *. Conserver une des valeurs dans une variable temporaire.',
 solution:fn('void echanger(int *a, int *b)', '    int tmp = *a;\n    *a = *b;\n    *b = tmp;'), explanation:'Les adresses sont passées par valeur, mais les objets pointés sont modifiés. Temps et espace O(1).',
 tests:[...[[3,7],[-5,2],[0,0],[2147483647,-2147483647]].map(([a,b])=>test(`${a}, ${b}`,`int a=${a},b=${b}; echanger(&a,&b); printf("%d %d",a,b);`,`${b} ${a}`)),test('Même adresse','int a=42; echanger(&a,&a); printf("%d",a);','42')]
},
{
 id:'minmax', title:'Deux résultats par pointeurs', chapter:2, difficulty:2,
 statement:'Écrire dans *min et *max le minimum et le maximum de t. Le tableau contient n ≥ 1 éléments. Les pointeurs de sortie sont valides, distincts et ne pointent pas dans t. Ne pas modifier t.', signature:'void minmax(const int t[], int n, int *min, int *max)', starter:fn('void minmax(const int t[], int n, int *min, int *max)','    // À compléter'), example:['t = {4, -2, 9} ; minmax(t, 3, &a, &b)','a = -2, b = 9'],
 hint:'Initialiser les deux résultats à t[0], puis parcourir le reste du tableau.',
 solution:fn('void minmax(const int t[], int n, int *min, int *max)', '    *min = *max = t[0];\n    for (int i = 1; i < n; i++) {\n        if (t[i] < *min) *min = t[i];\n        if (t[i] > *max) *max = t[i];\n    }'), explanation:'Un seul parcours et deux résultats par adresse. Temps O(n), espace O(1).',
 tests:arrays.filter(a=>a.length).map(a=>test(JSON.stringify(a),`int t[]={${arr(a)}}, lo=0,hi=0; minmax(t,${a.length},&lo,&hi); printf("%d %d",lo,hi);`,`${Math.min(...a)} ${Math.max(...a)}`))
},
{
 id:'copier', title:'Copier une chaîne', chapter:2, difficulty:2,
 statement:'Allouer et renvoyer une copie indépendante de la chaîne ASCII s, caractère nul compris. Renvoyer NULL si malloc échoue. Ne pas utiliser strdup, strlen ou strcpy. L’appelant libère la copie avec free.', signature:'char *copier(const char *s)', starter:'#include <stdlib.h>\n\n'+fn('char *copier(const char *s)','    // À compléter\n    return NULL;'), example:['copier("MPI")','une nouvelle chaîne "MPI"'],
 hint:'Compter les caractères, allouer n + 1 octets, puis copier jusqu’au caractère nul inclus.',
 solution:'#include <stdlib.h>\n\n'+fn('char *copier(const char *s)', '    int n = 0;\n    while (s[n]) n++;\n    char *p = malloc((n + 1) * sizeof(char));\n    if (p == NULL) return NULL;\n    for (int i = 0; i <= n; i++) p[i] = s[i];\n    return p;'), explanation:'La copie possède sa propre allocation. Temps O(n), espace O(n). Les tests ne simulent pas une panne d’allocation.',
 tests:['','a','MPI','bonjour monde','0123456789'].map(s=>test(JSON.stringify(s),`char s[]=${JSON.stringify(s)}; char *p=copier(s); if(!p) {printf("NULL");} else {printf("%d %s",p!=s,p); if(s[0]) {s[0]='X'; printf(" %d",p[0]!=s[0]);} free(p);}`,`1 ${s}${s?' 1':''}`))
},
{
 id:'filtrer', title:'Filtrage avec allocation', chapter:2, difficulty:3,
 statement:'Créer un nouveau tableau contenant, dans leur ordre initial, les éléments strictement positifs de t. Écrire sa longueur dans *m. Si aucun élément ne convient, renvoyer NULL et écrire 0. En cas d’échec de malloc, faire de même. n ≥ 0 ; m est valide et extérieur à t.', signature:'int *positifs(const int t[], int n, int *m)', starter:'#include <stdlib.h>\n\n'+fn('int *positifs(const int t[], int n, int *m)','    // À compléter\n    *m = 0;\n    return NULL;'), example:['t = {-2, 3, 0, 7}','{3, 7}, m = 2'],
 hint:'Compter les valeurs positives avant d’allouer, puis les recopier dans un second parcours.',
 solution:'#include <stdlib.h>\n\n'+fn('int *positifs(const int t[], int n, int *m)', '    *m = 0;\n    for (int i = 0; i < n; i++) if (t[i] > 0) (*m)++;\n    if (*m == 0) return NULL;\n    int *p = malloc(*m * sizeof(int));\n    if (!p) { *m = 0; return NULL; }\n    int j = 0;\n    for (int i = 0; i < n; i++)\n        if (t[i] > 0) p[j++] = t[i];\n    return p;'), explanation:'Deux parcours, donc O(n) en temps et O(m) pour le résultat. L’appelant doit libérer le tableau.',
 tests:arrays.map(a=>{const b=a.filter(x=>x>0);return test(JSON.stringify(a),`int t[]={${arr(a)}},m=-1; int *p=positifs(t,${a.length},&m); printf("%d ",m); if(!m) printf("%d",p==NULL); else if(p && m>=0 && m<=${a.length}) {for(int i=0;i<m;i++) printf("%d ",p[i]);} if(p && p!=t) free(p);`,`${b.length} ${b.length?b.join(' '):'1'}`);})
},
{
 id:'dichotomie', title:'Recherche dichotomique', chapter:3, difficulty:3,
 statement:'Dans un tableau t trié par ordre croissant au sens large, renvoyer l’indice de la première occurrence de x, ou -1 si x est absent. Exiger O(log(n + 1)) en temps. Le tableau peut être vide.', signature:'int chercher(const int t[], int n, int x)', starter:fn('int chercher(const int t[], int n, int x)','    // À compléter\n    return -1;'), example:['chercher((int[]){1, 3, 3, 8}, 4, 3)','1'],
 hint:'Chercher le premier indice où t[i] ≥ x sur un intervalle [g, d[. Vérifier ensuite l’égalité.',
 solution:fn('int chercher(const int t[], int n, int x)', '    int g = 0, d = n;\n    while (g < d) {\n        int m = g + (d - g) / 2;\n        if (t[m] < x) g = m + 1;\n        else d = m;\n    }\n    return g < n && t[g] == x ? g : -1;'), explanation:'L’intervalle des candidats est divisé par deux. Le choix t[m] ≥ x conserve la première occurrence. La complexité est à justifier séparément.',
 tests:[{a:[],x:1},{a:[1],x:1},{a:[1,3,3,8],x:3},{a:[1,3,3,8],x:2},{a:[1,3,3,8],x:8},{a:[-9,-5,0,2],x:-9},{a:[2,2,2,2],x:2}].map(({a,x})=>test(`${JSON.stringify(a)}, x = ${x}`,`int t[]={${arr(a)}}; printf("%d",chercher(t,${a.length},${x}));`,String(a.indexOf(x))))
},
{
 id:'insertion', title:'Tri par insertion', chapter:3, difficulty:3,
 statement:'Trier sur place les n éléments de t par ordre croissant avec le tri par insertion. Utiliser un espace supplémentaire O(1). Le tableau peut être vide.', signature:'void tri_insertion(int t[], int n)', starter:fn('void tri_insertion(int t[], int n)','    // À compléter'), example:['{4, 1, 3, 1}','{1, 1, 3, 4}'],
 hint:'Pour chaque indice i, insérer t[i] à sa place dans le préfixe déjà trié t[0..i[ en décalant les éléments.',
 solution:fn('void tri_insertion(int t[], int n)', '    for (int i = 1; i < n; i++) {\n        int x = t[i], j = i;\n        while (j > 0 && t[j - 1] > x) {\n            t[j] = t[j - 1];\n            j--;\n        }\n        t[j] = x;\n    }'), explanation:'Le préfixe t[0..i] est trié après chaque insertion. Temps O(n²) au pire, O(n) si déjà trié ; espace O(1).', tests:sortedTests('tri_insertion')
},
{
 id:'fusion', title:'Fusion de tableaux triés', chapter:3, difficulty:3,
 statement:'Fusionner les tableaux triés a (n éléments) et b (m éléments) dans r. r dispose de n + m cases et ne chevauche pas a ni b. Préserver les doublons, sans modifier les entrées. Temps attendu O(n + m).', signature:'void fusion(const int a[], int n, const int b[], int m, int r[])', starter:fn('void fusion(const int a[], int n, const int b[], int m, int r[])','    // À compléter'), example:['a = {1, 4}, b = {2, 4, 7}','r = {1, 2, 4, 4, 7}'],
 hint:'Maintenir un indice dans chaque tableau. Copier la plus petite tête, puis le suffixe restant.',
 solution:fn('void fusion(const int a[], int n, const int b[], int m, int r[])', '    int i = 0, j = 0, k = 0;\n    while (i < n && j < m)\n        r[k++] = a[i] <= b[j] ? a[i++] : b[j++];\n    while (i < n) r[k++] = a[i++];\n    while (j < m) r[k++] = b[j++];'), explanation:'Chaque élément est lu et copié une fois. Temps O(n + m), espace auxiliaire O(1), hors tableau de sortie.',
 tests:[[[1,4],[2,4,7]],[[],[]],[[1],[]],[[],[2]],[[1,1],[1,1]],[[-4,0,8],[-3,2,9]]].map(([a,b])=>test(`${JSON.stringify(a)} + ${JSON.stringify(b)}`,`int a[]={${arr(a)}},b[]={${arr(b)}},r[32]; fusion(a,${a.length},b,${b.length},r); for(int i=0;i<${a.length+b.length};i++) printf("%d ",r[i]);`,[...a,...b].sort((a,b)=>a-b).join(' ')))
},
{
 id:'tri-fusion', title:'Tri fusion récursif', chapter:3, difficulty:3,
 statement:'Trier t par tri fusion en O(n log(n + 1)). tmp est un tableau auxiliaire de n cases, distinct de t, déjà alloué. Vous pouvez écrire des fonctions auxiliaires. n ≥ 0.', signature:'void tri_fusion(int t[], int n, int tmp[])', starter:fn('void tri_fusion(int t[], int n, int tmp[])','    // À compléter'), example:['{5, -1, 3, 0}','{-1, 0, 3, 5}'],
 hint:'Trier récursivement chaque moitié, fusionner dans tmp, puis recopier dans t.',
 solution:fn('void tri_fusion(int t[], int n, int tmp[])', '    if (n < 2) return;\n    int m = n / 2;\n    tri_fusion(t, m, tmp);\n    tri_fusion(t + m, n - m, tmp);\n    int i = 0, j = m, k = 0;\n    while (i < m && j < n)\n        tmp[k++] = t[i] <= t[j] ? t[i++] : t[j++];\n    while (i < m) tmp[k++] = t[i++];\n    while (j < n) tmp[k++] = t[j++];\n    for (i = 0; i < n; i++) t[i] = tmp[i];'), explanation:'La récurrence T(n) = 2 T(n/2) + O(n) donne O(n log n). Le tampon est réutilisé ; pile récursive O(log n).',
 tests:arrays.map(a=>test(JSON.stringify(a),`int t[]={${arr(a)}},tmp[32]; tri_fusion(t,${a.length},tmp); for(int i=0;i<${a.length};i++) printf("%d ",t[i]);`,[...a].sort((a,b)=>a-b).join(' ')))
},
{
 id:'liste-inverser', title:'Retourner une liste chaînée', chapter:4, difficulty:3,
 statement:'Renvoyer la nouvelle tête après avoir inversé une liste simplement chaînée, sans allouer ni libérer de cellule. Modifier uniquement les liens. La liste est finie, sans cycle ; NULL représente la liste vide.', signature:'Cellule *retourner(Cellule *tete)', starter:'#include <stddef.h>\n\n'+listType+fn('Cellule *retourner(Cellule *tete)','    // À compléter\n    return tete;'), example:['1 → 2 → 3 → NULL','3 → 2 → 1 → NULL'],
 hint:'Conserver trois pointeurs : précédent, courant, suivant. Sauvegarder le lien suivant avant de le retourner.',
 solution:'#include <stddef.h>\n\n'+listType+fn('Cellule *retourner(Cellule *tete)', '    Cellule *precedent = NULL;\n    while (tete != NULL) {\n        Cellule *suivant = tete->suivante;\n        tete->suivante = precedent;\n        precedent = tete;\n        tete = suivant;\n    }\n    return precedent;'), explanation:'Chaque lien est inversé exactement une fois. Temps O(n), espace O(1).',
 tests:arrays.map(a=>test(JSON.stringify(a),`Cellule c[32]; int v[]={${arr(a)}}; for(int i=0;i<${a.length};i++) {c[i].valeur=v[i]; c[i].suivante=i+1<${a.length}?&c[i+1]:NULL;} Cellule *p=retourner(${a.length} ? c : NULL); int ok=1; for(int i=${a.length}-1;i>=0;i--) {if(p!=&c[i]) {ok=0;break;} printf("%d ",p->valeur); p=p->suivante;} printf("|%d",ok && p==NULL);`,`${[...a].reverse().join(' ')}${a.length?' ':''}|1`))
},
{
 id:'liste-fusion', title:'Fusionner deux listes', chapter:4, difficulty:3,
 statement:'Fusionner deux listes triées croissantes en réutilisant leurs cellules. Elles sont finies, sans cycle et disjointes. Ne pas allouer ni libérer de cellule. Renvoyer la tête de la liste fusionnée.', signature:'Cellule *fusion_listes(Cellule *a, Cellule *b)', starter:'#include <stddef.h>\n\n'+listType+fn('Cellule *fusion_listes(Cellule *a, Cellule *b)','    // À compléter\n    return NULL;'), example:['1 → 4 et 2 → 3','1 → 2 → 3 → 4'],
 hint:'Utiliser une cellule sentinelle locale et un pointeur sur la dernière cellule du résultat.',
 solution:'#include <stddef.h>\n\n'+listType+fn('Cellule *fusion_listes(Cellule *a, Cellule *b)', '    Cellule sentinelle = {0, NULL};\n    Cellule *fin = &sentinelle;\n    while (a && b) {\n        if (a->valeur <= b->valeur) {\n            fin->suivante = a; a = a->suivante;\n        } else {\n            fin->suivante = b; b = b->suivante;\n        }\n        fin = fin->suivante;\n    }\n    fin->suivante = a ? a : b;\n    return sentinelle.suivante;'), explanation:'Chaque cellule est rattachée une seule fois. Temps O(n + m), espace auxiliaire O(1).',
 tests:[[[1,4],[2,3]],[[],[]],[[1],[]],[[],[2]],[[-2,1,1],[-3,1,9]]].map(([a,b])=>test(`${JSON.stringify(a)} + ${JSON.stringify(b)}`,`int av[]={${arr(a)}},bv[]={${arr(b)}}; Cellule ac[16],bc[16]; for(int i=0;i<${a.length};i++){ac[i].valeur=av[i];ac[i].suivante=i+1<${a.length}?&ac[i+1]:NULL;} for(int i=0;i<${b.length};i++){bc[i].valeur=bv[i];bc[i].suivante=i+1<${b.length}?&bc[i+1]:NULL;} Cellule *p=fusion_listes(${a.length}?ac:NULL,${b.length}?bc:NULL); int count=0,valid=1; while(p && count<32){int known=0;for(int j=0;j<${a.length};j++) known|=p==&ac[j];for(int j=0;j<${b.length};j++) known|=p==&bc[j];if(!known){valid=0;break;} printf("%d ",p->valeur);p=p->suivante;count++;} printf("|%d",valid && !p && count==${a.length+b.length});`,`${[...a,...b].sort((a,b)=>a-b).join(' ')}${a.length+b.length?' ':''}|1`))
},
{
 id:'arbre-hauteur', title:'Hauteur d’un arbre', chapter:4, difficulty:3,
 statement:'Calculer récursivement la hauteur d’un arbre binaire : -1 pour l’arbre vide et 0 pour une feuille. L’arbre est fini et ne contient aucun cycle. Ne pas le modifier.', signature:'int hauteur(const Noeud *a)', starter:'#include <stddef.h>\n\n'+treeType+fn('int hauteur(const Noeud *a)'), example:['Arbre de racine 6, enfants 3 et 9, et petits-enfants 1 et 4','2'],
 hint:'La hauteur d’un nœud est 1 + le maximum des hauteurs de ses sous-arbres.',
 solution:'#include <stddef.h>\n\n'+treeType+fn('int hauteur(const Noeud *a)', '    if (!a) return -1;\n    int g = hauteur(a->gauche);\n    int d = hauteur(a->droite);\n    return 1 + (g > d ? g : d);'), explanation:'Chaque nœud est visité une fois. Temps O(n), pile O(h + 1).',
 tests:[test('Arbre vide','printf("%d",hauteur(NULL));','-1'),test('Feuille',treeSetup+'printf("%d",hauteur(&a));','0'),test('Arbre équilibré',treeSetup+'printf("%d",hauteur(&r));','2'),test('Chaîne gauche','Noeud a={1,NULL,NULL},b={2,&a,NULL},c={3,&b,NULL},d={4,&c,NULL}; printf("%d",hauteur(&d));','3'),test('Chaîne droite','Noeud a={1,NULL,NULL},b={2,NULL,&a},c={3,NULL,&b}; printf("%d",hauteur(&c));','2')]
},
{
 id:'abr-valide', title:'Vérifier un ABR', chapter:4, difficulty:4,
 statement:'Renvoyer 1 si l’arbre est un arbre binaire de recherche strict, 0 sinon. Toutes les clés à gauche d’un nœud doivent être strictement inférieures à sa clé, toutes celles à droite strictement supérieures. Les doublons sont interdits. L’arbre vide est valide ; les clés couvrent tout int.', signature:'int est_abr(const Noeud *a)', starter:'#include <stddef.h>\n\n'+treeType+fn('int est_abr(const Noeud *a)'), example:['Racine 6, à gauche 3 avec un enfant droit 7','0'],
 hint:'Propager deux bornes exclusives. Utiliser long long et des bornes au-delà de INT_MIN et INT_MAX, ou des pointeurs vers les clés bornes.',
 solution:'#include <stddef.h>\n#include <limits.h>\n\n'+treeType+fn('int verifier(const Noeud *a, long long lo, long long hi)', '    if (!a) return 1;\n    return lo < a->valeur && a->valeur < hi\n        && verifier(a->gauche, lo, a->valeur)\n        && verifier(a->droite, a->valeur, hi);')+'\n'+fn('int est_abr(const Noeud *a)', '    return verifier(a, (long long)INT_MIN - 1,\n                       (long long)INT_MAX + 1);'), explanation:'Vérifier seulement les enfants directs ne suffit pas. Les bornes portent la contrainte de tous les ancêtres. Temps O(n), pile O(h + 1).',
 tests:[test('Vide','printf("%d",est_abr(NULL));','1'),test('ABR valide',treeSetup+'printf("%d",est_abr(&r));','1'),test('Violation par un descendant',treeSetup+'b.valeur=7; printf("%d",est_abr(&r));','0'),test('Doublon',treeSetup+'b.valeur=3; printf("%d",est_abr(&r));','0'),test('Bornes de int','Noeud a={(-2147483647-1),NULL,NULL},b={2147483647,NULL,NULL},r={0,&a,&b}; printf("%d",est_abr(&r));','1')]
},
{
 id:'accessibles', title:'Parcours en profondeur', chapter:5, difficulty:4,
 statement:'Compter les sommets accessibles depuis s dans un graphe orienté. La matrice d’adjacence g est rangée par lignes dans un tableau de n² cases : g[u*n + v] vaut 1 si u → v, 0 sinon. 1 ≤ n ≤ 100 et 0 ≤ s < n. Compter s lui-même et gérer les cycles.', signature:'int accessibles(const int g[], int n, int s)', starter:fn('int accessibles(const int g[], int n, int s)'), example:['Arcs 0 → 1, 1 → 2, 2 → 0 ; sommet 3 isolé ; départ 0','3'],
 hint:'Marquer un sommet avant de visiter ses successeurs. Un tableau de 100 marques suffit.',
 solution:fn('int visiter(const int g[], int n, int s, int vu[])','    if (vu[s]) return 0;\n    vu[s] = 1;\n    int total = 1;\n    for (int v = 0; v < n; v++)\n        if (g[s*n + v]) total += visiter(g, n, v, vu);\n    return total;')+'\n'+fn('int accessibles(const int g[], int n, int s)','    int vu[100] = {0};\n    return visiter(g, n, s, vu);'), explanation:'Chaque ligne d’un sommet atteint est parcourue une fois. Temps O(n²) et espace O(n) avec cette représentation matricielle.',
 tests:[test('Sommet isolé','int g[]={0}; printf("%d",accessibles(g,1,0));','1'),test('Cycle et sommet isolé','int g[]={0,1,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0}; printf("%d",accessibles(g,4,0));','3'),test('Orientation','int g[]={0,1,0,0}; printf("%d",accessibles(g,2,1));','1'),test('Boucle','int g[]={1}; printf("%d",accessibles(g,1,0));','1'),test('Tous accessibles','int g[]={0,1,1,0, 0,0,0,1, 0,0,0,1, 0,0,0,0}; printf("%d",accessibles(g,4,0));','4')]
},
{
 id:'largeur', title:'Distances par parcours en largeur', chapter:5, difficulty:4,
 statement:'Écrire dans dist les distances minimales depuis s, en nombre d’arcs ; écrire -1 pour les sommets inaccessibles. g est une matrice d’adjacence orientée, indexée par g[u*n + v], de valeurs 0 ou 1. 1 ≤ n ≤ 100. dist contient n cases ; 0 ≤ s < n.', signature:'void distances(const int g[], int n, int s, int dist[])', starter:fn('void distances(const int g[], int n, int s, int dist[])','    // À compléter'), example:['Arcs 0 → 1, 0 → 2, 1 → 3 ; départ 0','dist = {0, 1, 1, 2}'],
 hint:'Utiliser une file FIFO de capacité 100. Marquer un sommet en lui attribuant sa distance dès son insertion dans la file.',
 solution:fn('void distances(const int g[], int n, int s, int dist[])','    int file[100], debut = 0, fin = 0;\n    for (int i = 0; i < n; i++) dist[i] = -1;\n    dist[s] = 0;\n    file[fin++] = s;\n    while (debut < fin) {\n        int u = file[debut++];\n        for (int v = 0; v < n; v++) {\n            if (g[u*n + v] && dist[v] == -1) {\n                dist[v] = dist[u] + 1;\n                file[fin++] = v;\n            }\n        }\n    }'), explanation:'La file visite les sommets par distance croissante. Temps O(n²), espace O(n).',
 tests:[{g:[0],n:1,s:0,e:'0'},{g:[0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0],n:4,s:0,e:'0 1 1 2'},{g:[0,1,0,0,0,1,1,0,0],n:3,s:1,e:'2 0 1'},{g:[0,0,0,0],n:2,s:1,e:'-1 0'},{g:[1,1,0,0],n:2,s:0,e:'0 1'}].map(({g,n,s,e})=>test(`n = ${n}, départ ${s}`,`int g[]={${arr(g)}},d[100]; distances(g,${n},${s},d); for(int i=0;i<${n};i++) printf("%d ",d[i]);`,e))
},
{
 id:'dijkstra', title:'Plus courts chemins pondérés', chapter:5, difficulty:4,
 statement:'Implémenter Dijkstra en O(n²). La matrice g, indexée par g[u*n + v], contient le poids de l’arc (entier de 0 à 1000) ou -1 si absent. Écrire dans dist les distances depuis s, et -1 pour les sommets inaccessibles. 1 ≤ n ≤ 100 et 0 ≤ s < n.', signature:'void dijkstra(const int g[], int n, int s, int dist[])', starter:fn('void dijkstra(const int g[], int n, int s, int dist[])','    // À compléter'), example:['0 → 1 (5), 0 → 2 (1), 2 → 1 (2) ; départ 0','dist = {0, 3, 1}'],
 hint:'Choisir à chaque étape le sommet non fixé de distance minimale, puis relâcher ses arcs sortants. Arrêter quand aucun sommet atteignable ne reste.',
 solution:fn('void dijkstra(const int g[], int n, int s, int dist[])','    int fixe[100] = {0};\n    for (int i = 0; i < n; i++) dist[i] = -1;\n    dist[s] = 0;\n    for (int k = 0; k < n; k++) {\n        int u = -1;\n        for (int v = 0; v < n; v++)\n            if (!fixe[v] && dist[v] >= 0\n                && (u < 0 || dist[v] < dist[u])) u = v;\n        if (u < 0) break;\n        fixe[u] = 1;\n        for (int v = 0; v < n; v++) {\n            int w = g[u*n + v];\n            if (w >= 0 && !fixe[v]\n                && (dist[v] < 0 || dist[u] + w < dist[v]))\n                dist[v] = dist[u] + w;\n        }\n    }'), explanation:'Les poids sont positifs ou nuls : la distance du sommet choisi est définitive. Temps O(n²), espace O(n).',
 tests:[{g:[-1],n:1,s:0,e:'0'},{g:[-1,5,1,-1,-1,-1,-1,2,-1],n:3,s:0,e:'0 3 1'},{g:[-1,0,-1,-1,-1,2,-1,-1,-1],n:3,s:0,e:'0 0 2'},{g:[-1,-1,-1,-1],n:2,s:0,e:'0 -1'},{g:[-1,8,2,-1,-1,1,4,-1,-1],n:3,s:1,e:'5 0 1'}].map(({g,n,s,e})=>test(`n = ${n}, départ ${s}`,`int g[]={${arr(g)}},d[100]; dijkstra(g,${n},${s},d); for(int i=0;i<${n};i++) printf("%d ",d[i]);`,e))
},
{
 id:'unir-trouver', title:'Unir et trouver', chapter:5, difficulty:4,
 statement:'Compléter trouver avec compression de chemin et unir avec union par rang. Initialement parent[i] = i et rang[i] = 0. unir fusionne les classes de a et b ; une union dans la même classe ne modifie pas les rangs. Les indices sont valides. Ne pas imposer un représentant particulier.', signature:'int trouver(int parent[], int x)\nvoid unir(int parent[], int rang[], int a, int b)', starter:fn('int trouver(int parent[], int x)','    // À compléter\n    return x;')+'\n'+fn('void unir(int parent[], int rang[], int a, int b)','    // À compléter'), example:['unir(0, 1), unir(1, 2)','trouver(0) == trouver(2)'],
 hint:'Rattacher la racine de plus petit rang à l’autre. À rang égal, choisir une racine et augmenter seulement son rang. trouver réécrit chaque parent rencontré vers la racine.',
 solution:fn('int trouver(int parent[], int x)','    if (parent[x] != x)\n        parent[x] = trouver(parent, parent[x]);\n    return parent[x];')+'\n'+fn('void unir(int parent[], int rang[], int a, int b)','    a = trouver(parent, a);\n    b = trouver(parent, b);\n    if (a == b) return;\n    if (rang[a] < rang[b]) parent[a] = b;\n    else {\n        parent[b] = a;\n        if (rang[a] == rang[b]) rang[a]++;\n    }'), explanation:'Les deux heuristiques donnent un coût amorti O(α(n)) par opération sur une suite d’unions et de recherches, hors initialisation. Les tests contrôlent les classes, les rangs et la compression.',
 tests:[test('Classes initiales','int p[]={0,1,2}; printf("%d %d",trouver(p,0)==trouver(p,1),trouver(p,2));','0 2'),test('Transitivité','int p[]={0,1,2,3},r[4]={0}; unir(p,r,0,1); unir(p,r,1,2); printf("%d %d",trouver(p,0)==trouver(p,2),trouver(p,0)!=trouver(p,3));','1 1'),test('Compression','int p[]={0,0,1,2}; printf("%d ",trouver(p,3)); printf("%d %d",p[3],p[2]);','0 0 0'),test('Union répétée','int p[]={0,1},r[2]={0}; unir(p,r,0,1); int z=trouver(p,0),old=r[z]; unir(p,r,0,1); printf("%d",r[z]==old);','1'),test('Union par rang','int p[]={0,1,2},r[]={0,2,0}; unir(p,r,0,1); printf("%d %d",trouver(p,0),r[1]);','1 2'),test('Augmentation du rang','int p[]={0,1,2,3},r[4]={0}; unir(p,r,0,1); unir(p,r,2,3); unir(p,r,0,2); printf("%d",r[trouver(p,3)]);','2')]
}
];

export function makeProgram(exercise: Exercise, code: string, index: number): string {
 const c = exercise.tests[index];
 if (!c) throw new Error('Test inconnu');
 return '#include <stdio.h>\n#include <stdlib.h>\n#include <stddef.h>\n#include <limits.h>\n#include <string.h>\n\n#line 1 "solution.c"\n' + code + '\n\n#line 1 "tests.c"\nint main(void) {\n' + c.code + '\nreturn 0;\n}\n';
}
