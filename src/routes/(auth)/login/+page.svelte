<script lang="ts">
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  // 공통 컴포넌트 임포트
  import AuthCard from '$lib/components/ui/styles/AuthCard.svelte';
  import Form from '$lib/components/ui/styles/Form.svelte';
  import FormGroup from '$lib/components/ui/styles/FormGroup.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import Loading from '$lib/components/ui/Loading.svelte';
  import Checkbox from '$lib/components/ui/styles/Checkbox.svelte';

  // 폼 상태
  let username = '';
  let password = '';
  let rememberMe = false;
  let isSubmitting = false;
  let formError = '';

  // 이미 로그인되어 있으면 대시보드로 리다이렉트
  onMount(() => {
    console.log('onMount');
    
    const unsubscribe = isAuthenticated.subscribe(value => {
      if (value) {
        goto('/dashboard');
      }
    });

    return unsubscribe;
  });

  // 로그인 처리
  async function handleSubmit() {
    console.log('handleSubmit 시작:', username, password);

    // 폼 유효성 검사
    if (!username) {
      formError = '아이디를 입력해주세요.';
      return;
    }

    if (!password) {
      formError = '비밀번호를 입력해주세요.';
      return;
    }

    formError = '';
    isSubmitting = true;

    try {
      console.log('authStore.login 호출 직전:', username, password, rememberMe);
      const success = await authStore.login(username, password, rememberMe);
      console.log('로그인 결과:', success);
      
      if (success) {
        // 약간의 지연 후 대시보드로 이동 (상태 업데이트 시간 확보)
        setTimeout(() => {
          goto('/dashboard');
        }, 100);
      } else {
        // 스토어에서 오류 메시지 가져오기
        const unsubscribe = authStore.subscribe(state => {
          formError = state.error || '로그인에 실패했습니다.';
        });
        unsubscribe();
      }
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
      formError = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<AuthCard 
  title="로그인" 
  subtitle="계정이 없으신가요?" 
  subtitleLink="/register" 
  subtitleLinkText="회원가입"
>
  <Form on:submit={handleSubmit}>
    <FormGroup>
      <Input
        type="text"
        id="username"
        name="username"
        label="아이디"
        placeholder="아이디를 입력하세요"
        autocomplete="username"
        required={true}
        bind:value={username}
      />
    </FormGroup>
    
    <FormGroup>
      <Input
        type="password"
        id="password"
        name="password"
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        autocomplete="current-password"
        required={true}
        bind:value={password}
      />
    </FormGroup>
    
    <div class="flex justify-between items-center mb-4">
      <Checkbox
        id="remember-me"
        name="remember-me"
        label="로그인 상태 유지"
        bind:checked={rememberMe}
      />
      
      <a href="/forgot-password" class="text-blue-500 hover:underline text-sm">
        비밀번호를 잊으셨나요?
      </a>
    </div>
    
    {#if formError}
      <Alert type="error" message={formError} />
    {/if}
    
    {#if $authStore.loading}
      <Loading text="로그인 중..." />
    {/if}
    
    <Button
      type="submit"
      variant="primary"
      fullWidth={true}
      disabled={isSubmitting || $authStore.loading}
    >
      로그인
    </Button>
  </Form>
</AuthCard> 