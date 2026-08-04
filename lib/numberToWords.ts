// Convertit un nombre en toutes lettres (en français)
// Simplifié pour les montants courants de loyer en CFA.

const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
const dizaines10 = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
const dizaines = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']

function convertirMoinsDeMille(n: number): string {
    if (n === 0) return ''
    
    let centaine = Math.floor(n / 100)
    let reste = n % 100
    let res = ''
    
    if (centaine > 0) {
        if (centaine === 1) res += 'cent '
        else res += unites[centaine] + ' cent '
    }
    
    if (reste > 0) {
        if (reste < 10) res += unites[reste]
        else if (reste < 20) res += dizaines10[reste - 10]
        else {
            let d = Math.floor(reste / 10)
            let u = reste % 10
            
            if (d === 7) {
                res += 'soixante'
                if (u === 1) res += ' et onze'
                else res += '-' + dizaines10[u]
            } else if (d === 9) {
                res += 'quatre-vingt'
                if (u === 0) res += 's'
                else res += '-' + dizaines10[u]
            } else {
                res += dizaines[d]
                if (u === 1 && d !== 8) res += ' et un'
                else if (u > 0) res += '-' + unites[u]
                else if (d === 8) res += 's'
            }
        }
    }
    return res.trim()
}

export function numberToWords(montant: number): string {
    if (montant === 0) return 'zéro'
    
    let res = ''
    let millions = Math.floor(montant / 1000000)
    let milliers = Math.floor((montant % 1000000) / 1000)
    let reste = montant % 1000
    
    if (millions > 0) {
        if (millions === 1) res += 'un million '
        else res += convertirMoinsDeMille(millions) + ' millions '
    }
    
    if (milliers > 0) {
        if (milliers === 1) res += 'mille '
        else res += convertirMoinsDeMille(milliers) + ' mille '
    }
    
    if (reste > 0) {
        res += convertirMoinsDeMille(reste)
    }
    
    return res.trim()
}
