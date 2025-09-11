import { useEffect } from "react";
import { useRouter } from "next/router";
// internal
import SEO from "@components/seo";
import BoardAdvisorArea from "@components/board-advisor/board-advisorarea";
import Wrapper from "@layout/wrapper";
import Footer from "@layout/footer";
import Header from "@layout/header";
export default function BoardAdvisor() {
    return (
        <Wrapper>
            <SEO pageTitle={"Board-Advisory"} />
            <Header style_2={true} />

            <BoardAdvisorArea />

            <Footer />
        </Wrapper>
    );
}

