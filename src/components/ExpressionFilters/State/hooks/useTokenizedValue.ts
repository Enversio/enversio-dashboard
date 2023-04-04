import { ChangeEvent, KeyboardEvent, useState } from "react"
import { Value } from "../types"

interface Token {
  isDirty: boolean
  value: string
}

interface TokenizedState {
  stringValue: string,
  tokens: Token[],
  selected: Value[]
}

const SPECIAL_CHAR = "*"


const isCommaRemovalAttempt = (currentValue: string, event: KeyboardEvent<HTMLInputElement>) => {  
  const target = event.target as HTMLInputElement;
  const valueIndex = target.selectionStart - 1

  if (event.code !== "Backspace") {return false}

  return currentValue.charAt(valueIndex) === ","
}

const markEditionPlace = (currentValue: string, selection: number) => `${currentValue.slice(0, selection)}${SPECIAL_CHAR}${currentValue.slice(selection)}`

const isMarkedPlace = (element: string) => element.includes(SPECIAL_CHAR)

const cleanMark = (element: string) => element.replace(SPECIAL_CHAR, "")

const cleanToDirty = (el: string) => {
  if (isMarkedPlace(el)) {
    return { isDirty: true, value: cleanMark(el) }
  }

  return { isDirty: false, value: el }
}

const valueToToken = (el: Value) => ({ isDirty: false, value: el.displayName })


const valueToString = (el: Value) => el.displayName

const createTokensFromSelected = (initialValue: Value[]) => initialValue
    .map(valueToToken)

const createStringValueFromSelected = (initialValue: Value[]) => {
  if (initialValue.length == 0) {return ""}

  return initialValue
    .map(valueToString)
    .join(",")
    + ","
}

const generateDirtyTokens = (editedValue: string) => editedValue
    .split(",")
    .map(cleanToDirty)

const cleanDirtyToken = (tokens: Token[], value: string) => tokens.map(tk => {
    if (tk.isDirty) {
      return { isDirty: false, value }
    }

    return tk
  })

const generateValueFromTokens = (tokensValues: string[]) => tokensValues.join(",") + ","

const obtainCleanTokens = (tokens: Token[]) => tokens.filter(t => !t.isDirty)

const obtainCleanSelected = (selected: Value[], tokenValues: string[]) => selected.filter(byTokenValues(tokenValues))

const obtainTokenValues = (tokens: Token[]) => tokens.filter(t => t.value).map(t => t.value)

const obtainSearchInput = (tokens: Token[]) => tokens.find(t => t.isDirty)?.value || ""

const obtainNonEmptyTokens = (tokens) => tokens.filter(t => t.value.length > 0)

const byTokenValues = (tokensValues: string[]) => (el: Value) => tokensValues.includes(el.displayName)

export const useTokenizedValue = (initial: Value[]) => {
  const [tokenizedState, setTokenizedState] = useState<TokenizedState>({
    stringValue: createStringValueFromSelected(initial),
    tokens: createTokensFromSelected(initial),
    selected: initial
  })

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isCommaRemovalAttempt(tokenizedState.stringValue, event)) {
      event.preventDefault()      
    }
  }

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    setTokenizedState((currentState) => {      
      const { value: newValue, selectionStart} = event.target
      const newTokens = generateDirtyTokens(markEditionPlace(newValue, selectionStart))

      return {
        stringValue: newValue,
        tokens: newTokens,
        selected: currentState.selected
      }
    })
  }

  const changeAt = (item: Value) => {
    setTokenizedState((currentState) => {
      const newTokens = cleanDirtyToken(currentState.tokens, item.displayName)
      const tokenValues = obtainTokenValues(newTokens)
      const newValue = generateValueFromTokens(tokenValues)

      return {
        stringValue: newValue,
        tokens: newTokens,
        selected: currentState.selected.concat(item)
      }
    })
  }

  const clean = () => {
    setTokenizedState((currentState) => {
      const cleanTokens = obtainCleanTokens(currentState.tokens)
      const tokenValues = obtainTokenValues(cleanTokens)
      const cleanValue = generateValueFromTokens(tokenValues)
      const cleanSelected = obtainCleanSelected(currentState.selected, tokenValues)

      return {
        stringValue: cleanValue,
        tokens: cleanTokens,
        selected: cleanSelected
      }
    })
  }

  return {
    changeAt,
    change,
    keyDown,
    clean,
    value: tokenizedState.stringValue,
    selected: tokenizedState.selected,
    tokens: obtainNonEmptyTokens(tokenizedState.tokens),
    input: obtainSearchInput(tokenizedState.tokens)
  }
}