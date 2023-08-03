import React, { useState } from 'react'
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary'

interface ProductData {
  productName: string
  productReference: string
  price: number
}

const products = {
  '1': {
    productName: 'xxxx',
    price: 0
  },
  '2': {
    productName: 'xxxx',
    price: 0
  }
} as unknown as Record<string, ProductData>

function makeRequestClosure() {
  let count = 0

  return async function (productId: string): Promise<ProductData> {
    const product = products[productId]
  
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (product) {
          
          if (count > 0) {
            product.productReference = `${productId}-xxxx`
          }

          resolve(product)
          count++
        } else {
          reject(new Error('It was not product found'))
        }

      }, 500)
    })
  }
}

const makeRequest = makeRequestClosure()

const productDetails: Record<string, Record<string, string>> = {
  '1-xxxx': {
    care: 'Do not wash in washing machine'
  },
  '2-xxxx': {
    care: 'Do not wash in washing machine'
  }
}

function ProductInfo ({ product }: {product: ProductData}) {

  return (
    <div>
      <p>Name: {product.productName}</p>
      <p>Reference: {product.productReference}</p>
      <p>Price: {product.price}</p>
      <p>Care: {productDetails[product.productReference].care}</p>
    </div>
  )
}

interface ErrorFallbackProps {
  error: Error
}

function ErrorFallback ({ error }: ErrorFallbackProps) {
  const { resetBoundary } = useErrorBoundary()

  return (
    <div>
      <p>There was an error: <strong>{error.message}</strong></p>
      <button onClick={resetBoundary}>Try Again</button>
    </div>
  )
}

  function App() {
    const [productData, setProductData] = React.useState<ProductData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState('idle')
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleSearch = () => {
      getProductData()
    }

    const getProductData = () => {
      const productId = inputRef.current?.value ?? ''

      if (!productId) {
        return
      }

      setStatus('pending')
      makeRequest(productId)
        .then((data) => {
          setStatus('resolved')
          setProductData(data)
        })
        .catch((error: Error) => {
          setStatus('rejected')
          setError(error.message)
        })
    }

    const renderContent = () => {
      switch (status) {
        case 'pending':
          return (
            <p>Loading</p>
          )
        case 'resolved':
          return (
            <ProductInfo product={productData!} />
          )
        case 'rejected':
          return (
            <div>{error}</div>
          )
        default:
          return (
            <p>Type a product ID</p>
          )
      }
    }

    return (
      <div>
        <div>
          <input type="text" ref={inputRef} />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div>
          <ErrorBoundary 
            FallbackComponent={ErrorFallback} 
            onReset={getProductData}
            resetKeys={[status]}
          >
            {renderContent()}
          </ErrorBoundary>
        </div>
      </div>
    )
  } 

export default App
