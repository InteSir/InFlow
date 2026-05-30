import { useState, useEffect} from 'react'
// interface UseDebouncedSearchOptions {
//   delay?: number
//   immediate?: boolean
// }
// const useDebouncedSearch = (
//   initialValue: string,
//   options: UseDebouncedSearchOptions = {}
// ) => {
//   const { delay = 500, immediate = false } = options

//   const [searchTerm, setSearchTerm] = useState(initialValue)
//   const [debouncedTerm, setDebouncedTerm] = useState(initialValue)

//   const setSearchTermDebounced = useCallback((term: string) => {
//     setSearchTerm(term)
//   }, [])

//   useEffect(() => {
//     if (immediate && searchTerm === initialValue) {
//       setDebouncedTerm(searchTerm)
//       return
//     }

//     const handler = setTimeout(() => {
//       setDebouncedTerm(searchTerm)
//     }, delay)

//     return () => {
//       clearTimeout(handler)
//     }
//   }, [searchTerm, delay, initialValue, immediate])

//   return { debouncedTerm, searchTerm, setSearchTerm: setSearchTermDebounced }
// }
// export default useDebouncedSearch

export default function useDebounce(value:string,delay:number = 500){
  const [debounceValue,setDebouncedValue] = useState(value);
  useEffect(()=>{
    const timer = setTimeout(()=>{
      setDebouncedValue(value);
    },delay);

    return () => clearTimeout(timer);
  },[value,delay]);

  return debounceValue;
}

