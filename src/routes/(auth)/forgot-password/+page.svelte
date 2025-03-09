<script lang="ts">
  import { goto } from '$app/navigation';
  
  // 공통 컴포넌트 임포트
  import AuthCard from '$lib/components/ui/styles/AuthCard.svelte';
  import Form from '$lib/components/ui/styles/Form.svelte';
  import FormGroup from '$lib/components/ui/styles/FormGroup.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import Loading from '$lib/components/ui/Loading.svelte';
  
  // 폼 상태
  let email = '';
  let isSubmitting = false;
  let formError = '';
  let formSuccess = '';
  
  // 비밀번호 찾기 처리
  async function handleSubmit() {
    // 폼 유효성 검사
    if (!email) {
      formError = '이메일을 입력해주세요.';
      return;
    }
    
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      formError = '유효한 이메일 주소를 입력해주세요.';
      return;
    }
    
    formError = '';
    formSuccess = '';
    isSubmitting = true;
    
    try {
      // 여기에 실제 비밀번호 찾기 API 호출 코드가 들어갈 예정
      // 현재는 임시로 성공 메시지만 표시
      
      // 임시 지연 (실제 API 호출 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      formSuccess = '비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.';
    } catch (error) {
      console.error('비밀번호 찾기 처리 중 오류:', error);
      formError = error instanceof Error ? error.message : '비밀번호 찾기 중 오류가 발생했습니다.';
    } finally {
      isSubmitting = false;
    }
  }
  
  // 로그인 페이지로 이동
  function goToLogin() {
    goto('/login');
  }
</script>

<AuthCard 
  title="비밀번호 찾기" 
  subtitle="가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다."
>
  <Form on:submit={handleSubmit}>
    <FormGroup>
      <Input
        type="email"
        id="email"
        name="email"
        label="이메일"
        placeholder="example@example.com"
        autocomplete="email"
        required={true}
        bind:value={email}
      />
    </FormGroup>
    
    {#if formError}
      <Alert type="error" message={formError} />
    {/if}
    
    {#if formSuccess}
      <Alert type="success" message={formSuccess} />
    {/if}
    
    <div class="flex justify-between items-center mt-4">
      <Button 
        type="button" 
        variant="secondary" 
        on:click={goToLogin}
      >
        로그인 페이지로 돌아가기
      </Button>
      
      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
      >
        {#if isSubmitting}
          <Loading text="처리 중..." />
        {:else}
          비밀번호 재설정 링크 받기
        {/if}
      </Button>
    </div>
  </Form>
</AuthCard> 