import type { AppProps } from "next/app"
import Head from 'next/head'
import getConfig from 'next/config'


import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import HashRouterViews from '@/components/HashRouterViews'

import Home from '@/views/Home'
import Admin from '@/views/Admin'
import AdminDeposits from '@/views/AdminDeposits'
import AdminManageMonths from '@/views/AdminManageMonths'

import MarkDownViewer from '@/views/MarkDownViewer'


import Page404 from '@/pages/404'

import AppRootWrapper from '@/components/AppRootWrapper'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

import NETWORKS from '@/contstans/NETWORKS'

import { TITLE } from '@/config'

function GGWStakeView(pageProps) {
  const viewsPaths = {
    '/': Home,
    '/admin': Admin,
    '/admin/deposits': AdminDeposits,
    '/admin/managemonths': AdminManageMonths,
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto p-10 max-sm:p-4 max-sm:pt-20 max-md:pt-20 flex-grow">
          <HashRouterViews
            views={{
              ...viewsPaths,
            }}
            props={{
            }}
            on404={Page404}
          />
        </div>
        <Footer />
      </div>
    </>
  )
}

export default GGWStakeView;
